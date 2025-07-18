import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Star, Zap } from 'lucide-react';
import { StripeProduct } from '@/stripe-config';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useApiAuth } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface PricingCardProps {
  product: StripeProduct;
  popular?: boolean;
  currentPlan?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ product, popular = false, currentPlan }) => {
  const { user } = useUser();
  const { getAuthHeaders, isSignedIn } = useApiAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const isCurrentPlan = currentPlan?.toLowerCase() === product.name.toLowerCase();

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      navigate('/sign-up');
      return;
    }

    // Prevent duplicate requests
    const currentRequestId = Date.now().toString();
    setRequestId(currentRequestId);
    
    if (loading) {
      console.log('Request already in progress, skipping...');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting checkout process...');
      console.log('Product:', product);
      console.log('User:', user?.id);
      
      // Get authentication headers
      const headers = await getAuthHeaders();
      console.log('Got auth headers:', headers ? 'Yes' : 'No');
      
      // Map product name to plan type
      const planMap: { [key: string]: string } = {
        'Starter': 'starter',
        'Growth': 'growth',
        'Business': 'business'
      };
      
      const plan = planMap[product.name];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Check if this is a downgrade
      const planHierarchy = { starter: 1, growth: 2, business: 3 };
      const currentPlanLevel = planHierarchy[currentPlan?.toLowerCase() as keyof typeof planHierarchy] || 0;
      const selectedPlanLevel = planHierarchy[plan as keyof typeof planHierarchy] || 0;
      
      if (currentPlanLevel > selectedPlanLevel) {
        // This is a downgrade - show confirmation
        const confirmed = window.confirm(
          `You're downgrading from ${currentPlan} to ${product.name}. The change will take effect at your next billing cycle. Continue?`
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }
      
      // Check if request is still current
      if (requestId !== currentRequestId) {
        console.log('Request superseded, aborting...');
        return;
      }
      
      // Create checkout session with timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
      
      let response;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.BILLING}/checkout-session-direct`), {
            method: 'POST',
            headers,
            body: JSON.stringify({ plan }),
            signal: controller.signal,
          });
          break; // Success, exit retry loop
        } catch (error) {
          retries++;
          if (retries > maxRetries || error.name === 'AbortError') {
            throw error;
          }
          console.log(`Retry ${retries}/${maxRetries} after error:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
      }
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Checkout failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Checkout response:', data);
      
      if (!data.checkout_url) {
        throw new Error('No checkout URL received from server');
      }

      // Check if request is still current before redirecting
      if (requestId === currentRequestId) {
        // Immediate redirect for better performance
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'Failed to start checkout. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Show specific guidance for common issues
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Please sign out and sign back in to continue with checkout.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API endpoint not found. Please check your backend configuration.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. This is likely a Stripe configuration issue.';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        }
      }
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (requestId === currentRequestId) {
        setLoading(false);
        setRequestId(null);
      }
    }
    if (!isSignedIn) {
      navigate('/sign-up');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting checkout process...');
      console.log('Product:', product);
      console.log('User:', user?.id);
      
      // Get authentication headers
      const headers = await getAuthHeaders();
      console.log('Got auth headers:', headers ? 'Yes' : 'No');
      
      // Map product name to plan type
      const planMap: { [key: string]: string } = {
        'Starter': 'starter',
        'Growth': 'growth',
        'Business': 'business'
      };
      
      const plan = planMap[product.name];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Check if this is a downgrade
      const planHierarchy = { starter: 1, growth: 2, business: 3 };
      const currentPlanLevel = planHierarchy[currentPlan?.toLowerCase() as keyof typeof planHierarchy] || 0;
      const selectedPlanLevel = planHierarchy[plan as keyof typeof planHierarchy] || 0;
      
      if (currentPlanLevel > selectedPlanLevel) {
        // This is a downgrade - show confirmation
        const confirmed = window.confirm(
          `You're downgrading from ${currentPlan} to ${product.name}. The change will take effect at your next billing cycle. Continue?`
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }
      
            // Create checkout session with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.BILLING}/checkout-session-direct`), {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Checkout failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Checkout response:', data);
      
      if (!data.checkout_url) {
        throw new Error('No checkout URL received from server');
      }

      // Immediate redirect for better performance
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'Failed to start checkout. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Show specific guidance for common issues
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Please sign out and sign back in to continue with checkout.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API endpoint not found. Please check your backend configuration.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. This is likely a Stripe configuration issue.';
        }
      }
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = getFeaturesByPlan(product.name);

  return (
    <Card className={`relative flex flex-col h-full transition-all duration-300 hover:scale-105 ${
      popular 
        ? 'bg-gradient-to-b from-blue-500/25 to-violet-500/25 border-2 border-blue-400 shadow-2xl shadow-blue-400/50' 
        : 'bg-slate-800/40 border border-slate-600/50 hover:bg-slate-800/60'
    } backdrop-blur-sm`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-blue-500 to-violet-500 text-white px-4 py-1 text-sm font-medium">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-8 pt-8">
        <div className="mb-4">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
            popular 
              ? 'bg-gradient-to-r from-blue-400 to-violet-400 shadow-lg shadow-blue-400/30' 
              : 'bg-slate-700/60 border border-slate-600/50'
          }`}>
            <Zap className={`h-8 w-8 ${popular ? 'text-white' : 'text-blue-300'}`} />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-white mb-2">{product.name}</CardTitle>
        <CardDescription className={`text-lg leading-relaxed ${
          popular ? 'text-white' : 'text-slate-300'
        }`}>
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow px-8">
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold text-white">${product.price}</span>
                      <span className={`ml-2 text-xl ${
            popular ? 'text-white/80' : 'text-slate-400'
          }`}>
            /{product.interval}
          </span>
          </div>
          <p className={`mt-2 ${
            popular ? 'text-white/80' : 'text-slate-400'
          }`}>per team</p>
        </div>
        
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className={`ml-3 leading-relaxed ${
                popular ? 'text-white' : 'text-slate-300'
              }`}>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="px-8 pb-8">
        <Button
          className={`w-full py-6 text-lg font-medium transition-all duration-200 ${
            popular
              ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-lg shadow-blue-500/25'
              : isCurrentPlan
              ? 'bg-green-500/20 border border-green-500/50 text-green-400 cursor-not-allowed'
              : 'bg-slate-700/60 border border-slate-600/50 text-white hover:bg-slate-700/80'
          }`}
          onClick={handleSubscribe}
          disabled={loading || isCurrentPlan}
        >
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isCurrentPlan ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Current Plan
            </>
          ) : isSignedIn ? (
            loading ? 'Processing...' : (() => {
              const planHierarchy = { starter: 1, growth: 2, business: 3 };
              const currentPlanLevel = planHierarchy[currentPlan?.toLowerCase() as keyof typeof planHierarchy] || 0;
              const selectedPlanLevel = planHierarchy[product.name.toLowerCase() as keyof typeof planHierarchy] || 0;
              
              if (currentPlanLevel > selectedPlanLevel) {
                return 'Downgrade Plan';
              } else if (currentPlanLevel < selectedPlanLevel) {
                return 'Upgrade Plan';
              } else {
                return 'Start Free Trial';
              }
            })()
          ) : (
            'Sign Up to Continue'
          )}
        </Button>
        {!isCurrentPlan && (
          <p className={`text-center text-sm mt-3 ${
            popular ? 'text-white/80' : 'text-slate-400'
          }`}>
            14-day free trial • No credit card required
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

const getFeaturesByPlan = (planName: string): string[] => {
  const features = {
    starter: [
      'Up to 3 team members',
      'Slack & GitHub integration',
      'Basic compliance monitoring',
      'Standard policy templates',
      'Basic compliance reports',
      'Email support',
      'Dashboard analytics'
    ],
    growth: [
      'Up to 10 team members',
      'Slack & GitHub integration',
      'Advanced compliance monitoring',
      'Custom policy templates',
      'Advanced compliance reports',
      'Priority email support',
      'Advanced analytics dashboard',
      'API access',
      'Real-time alerts'
    ],
    business: [
      'Unlimited team members',
      'All integrations included',
      'Enterprise compliance monitoring',
      'Custom workflows & policies',
      'Custom compliance reports',
      'Priority support & phone',
      'Advanced analytics & insights',
      'Full API access',
      'Dedicated account manager',
      'Custom integrations',
      'SSO & advanced security',
      'White-label options'
    ]
  };

  return features[planName.toLowerCase() as keyof typeof features] || [];
};

export default PricingCard;