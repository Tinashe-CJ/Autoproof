import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { jwtVerify, createRemoteJWKSet } from 'npm:jose@5.2.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const clerkPublishableKey = Deno.env.get('CLERK_PUBLISHABLE_KEY')!;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecret || !clerkPublishableKey) {
  console.error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

// Extract instance ID from Clerk publishable key to construct JWKS URL
function getClerkJWKSUrl(publishableKey: string): string {
  // Clerk publishable key format: pk_test_<instance>.<domain>.clerk.accounts.dev
  // or pk_live_<instance>.<domain>.clerk.accounts.dev
  const match = publishableKey.match(/pk_(test|live)_(.+?)\.(.+?)\.clerk\.accounts\.dev/);
  if (!match) {
    throw new Error('Invalid Clerk publishable key format');
  }
  
  const [, , instance, domain] = match;
  return `https://${instance}.${domain}.clerk.accounts.dev/.well-known/jwks.json`;
}

const JWKS = createRemoteJWKSet(new URL(getClerkJWKSUrl(clerkPublishableKey)));

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

async function verifyClerkJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWKS);
    return {
      userId: payload.sub as string,
      email: payload.email as string,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid JWT token');
  }
}

function validateParameters(values: any, expected: any): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else if (expectation && expectation.values) {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}

Deno.serve(async (req) => {
  try {
    console.log('Stripe checkout function called');
    
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { price_id, success_url, cancel_url, mode } = await req.json();
    console.log('Request data:', { price_id, success_url, cancel_url, mode });

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (error) {
      console.error('Parameter validation error:', error);
      return corsResponse({ error }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return corsResponse({ error: 'Authorization header required' }, 401);
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify Clerk JWT
    let user;
    try {
      user = await verifyClerkJWT(token);
      console.log('User authenticated:', user.userId);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    if (!user || !user.userId) {
      console.error('No user found in JWT');
      return corsResponse({ error: 'User not found' }, 404);
    }

    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Failed to fetch customer information from the database', getCustomerError);
      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }

    let customerId;

    if (!customer || !customer.customer_id) {
      console.log('Creating new Stripe customer');
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.userId,
        },
      });

      console.log(`Created new Stripe customer ${newCustomer.id} for user ${user.userId}`);

      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user.userId,
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        console.error('Failed to save customer information in the database', createCustomerError);

        try {
          await stripe.customers.del(newCustomer.id);
          await supabase.from('stripe_subscriptions').delete().eq('customer_id', newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to clean up after customer mapping error:', deleteError);
        }

        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }

      if (mode === 'subscription') {
        const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
          customer_id: newCustomer.id,
          status: 'not_started',
        });

        if (createSubscriptionError) {
          console.error('Failed to save subscription in the database', createSubscriptionError);

          try {
            await stripe.customers.del(newCustomer.id);
          } catch (deleteError) {
            console.error('Failed to delete Stripe customer after subscription creation error:', deleteError);
          }

          return corsResponse({ error: 'Unable to save the subscription in the database' }, 500);
        }
      }

      customerId = newCustomer.id;

      console.log(`Successfully set up new customer ${customerId} with subscription record`);
    } else {
      customerId = customer.customer_id;
      console.log('Using existing customer:', customerId);

      if (mode === 'subscription') {
        const { data: subscription, error: getSubscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (getSubscriptionError) {
          console.error('Failed to fetch subscription information from the database', getSubscriptionError);
          return corsResponse({ error: 'Failed to fetch subscription information' }, 500);
        }

        if (!subscription) {
          const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
            customer_id: customerId,
            status: 'not_started',
          });

          if (createSubscriptionError) {
            console.error('Failed to create subscription record for existing customer', createSubscriptionError);
            return corsResponse({ error: 'Failed to create subscription record for existing customer' }, 500);
          }
        }
      }
    }

    console.log('Creating Stripe checkout session');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode,
      success_url,
      cancel_url,
    });

    console.log(`Created checkout session ${session.id} for customer ${customerId}`);

    return corsResponse({ url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    console.error('Full error:', error);
    return corsResponse({ error: error.message }, 500);
  }
});