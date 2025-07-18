import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('your-supabase-anon-key') || supabaseAnonKey.includes('REPLACE_WITH_YOUR_ACTUAL_ANON_KEY')) {
  console.error('Missing or invalid Supabase environment variables')
  console.error('Please update your .env file with:')
  console.error('- VITE_SUPABASE_URL: Your Supabase project URL')
  console.error('- VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key')
  console.error('Find these values in your Supabase project dashboard under Settings -> API')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Subscription helper functions
export const getUserSubscription = async () => {
  try {
    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .maybeSingle()
    
    return { data, error }
  } catch (error) {
    console.warn('Subscription data not available:', error)
    return { data: null, error }
  }
}

export const getUserOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('stripe_orders')
      .select('*')
      .order('order_date', { ascending: false })
    
    return { data, error }
  } catch (error) {
    console.warn('Order data not available:', error)
    return { data: null, error }
  }
}

// Stripe checkout function
export const createCheckoutSession = async (priceId: string, mode: 'subscription' | 'payment' = 'subscription', accessToken?: string) => {
  // Check if Supabase is properly configured
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured. Please click "Connect to Supabase" in the top right corner to set up billing.')
  }

  // Validate the Supabase URL format
  if (supabaseUrl.includes('placeholder') || !supabaseUrl.includes('supabase.co') || supabaseUrl === 'https://placeholder.supabase.co') {
    throw new Error('Invalid Supabase configuration. Please connect to Supabase to enable billing.')
  }

  // Use the provided access token (should be Clerk JWT)
  if (!accessToken) {
    throw new Error('Authentication required. Please sign out and sign back in to continue.')
  }

  try {
    console.log('Creating checkout session for price:', priceId);
    
    const functionUrl = `${supabaseUrl}/functions/v1/stripe-customer-checkout`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/pricing`
      })
    })

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText || `HTTP ${response.status}` };
      }
      
      if (response.status === 404) {
        throw new Error('Billing system not available. Please try again later or contact support.')
      }
      
      if (response.status === 401) {
        throw new Error('Authentication expired. Please sign out and sign back in.')
      }
      
      throw new Error(errorData.error || 'Checkout failed. Please try again or contact support.')
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error('Invalid response from billing system. Please try again.');
    }
    
    console.log('Checkout session created successfully');
    return result;
  } catch (error) {
    console.error('Checkout error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.')
    }
    throw error
  }
}