import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { jwtVerify } from 'npm:jose@5.2.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const clerkJwtKey = Deno.env.get('CLERK_JWT_KEY')!;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecret || !clerkJwtKey) {
  console.error('Missing required environment variables');
  console.error('supabaseUrl:', !!supabaseUrl);
  console.error('supabaseServiceKey:', !!supabaseServiceKey);
  console.error('stripeSecret:', !!stripeSecret);
  console.error('clerkJwtKey:', !!clerkJwtKey);
}

const supabase = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
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
    console.log('Attempting to verify JWT token...');
    console.log('Token length:', token.length);
    console.log('JWT Key available:', !!clerkJwtKey);
    console.log('JWT Key length:', clerkJwtKey.length);
    
    // Use the static CLERK_JWT_KEY for verification
    const { payload } = await jwtVerify(token, new TextEncoder().encode(clerkJwtKey));
    
    console.log('JWT verification successful');
    console.log('Payload subject:', payload.sub);
    console.log('Payload email:', payload.email);
    
    return {
      userId: payload.sub as string,
      email: payload.email as string,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    throw new Error('Invalid JWT token');
  }
}

Deno.serve(async (req) => {
  try {
    console.log('Stripe customer checkout function called');
    
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    // Extract Clerk JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      return corsResponse({ error: 'Missing Authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token length:', token.length);
    
    let user;
    
    try {
      user = await verifyClerkJWT(token);
      console.log('User authenticated successfully:', user.userId);
    } catch (error) {
      console.error('Authentication error:', error);
      return corsResponse({ error: 'Authentication failed' }, 401);
    }

    const { price_id, success_url, cancel_url, mode } = await req.json();
    console.log('Request data:', { price_id, success_url, cancel_url, mode });

    // Check if customer already exists
    const { data: existingCustomer, error: customerLookupError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.userId)
      .maybeSingle();

    if (customerLookupError) {
      console.error('Failed to look up existing customer', customerLookupError);
      return corsResponse({ error: 'Failed to look up existing customer' }, 500);
    }

    let customerId;

    if (!existingCustomer) {
      // Create new Stripe customer
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
      customerId = existingCustomer.customer_id;
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

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    console.error('Full error:', error);
    return corsResponse({ error: error.message }, 500);
  }
});