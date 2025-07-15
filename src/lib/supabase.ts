import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - some features may not work')
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
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || !supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
    throw new Error('Supabase not configured. Please click "Connect to Supabase" in the top right corner to set up your database connection.')
  }

  let token = accessToken;
  
  // If no access token provided, try to get from Supabase as fallback
  if (!token) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required. Please sign in to continue with checkout.')
    }
    token = session.access_token
  }

  try {
    console.log('Making request to stripe-checkout function');
    console.log('Price ID:', priceId);
    console.log('Mode:', mode);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/pricing`
      })
    })

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error response:', errorData);
      
      if (response.status === 404) {
        throw new Error('Stripe checkout function not found. Please ensure your Supabase project has the stripe-checkout edge function deployed.')
      }
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign out and sign back in.')
      }
      
      throw new Error(errorData.error || `Checkout failed with status ${response.status}. Please try again or contact support.`)
    }

    const result = await response.json();
    console.log('Checkout session created:', result);
    return result;
  } catch (error) {
    console.error('Checkout session error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.')
    }
    throw error
  }
}