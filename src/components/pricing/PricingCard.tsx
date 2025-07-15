import React, { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Star, Zap } from 'lucide-react';
import { StripeProduct } from '@/stripe-config';
import { createCheckoutSession } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface PricingCardProps {
  product: StripeProduct;
  popular?: boolean;
  currentPlan?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ product, popular = false, currentPlan }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isCurrentPlan = currentPlan?.toLowerCase() === product.name.toLowerCase();

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/sign-up');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting checkout process...');
      console.log('Product:', product);
      console.log('User:', user?.id);
      
      // Get Clerk session token
      const token = await getToken();
      console.log('Got Clerk token:', token ? 'Yes' : 'No');
      
      const response = await createCheckoutSession(product.priceId, product.mode, token);
      console.log('Checkout response:', response);
      
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'Failed to start checkout. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Show specific guidance for common issues
        if (error.message.includes('Supabase not configured')) {
          errorMessage = 'Database connection required. Please click "Connect to Supabase" in the top right corner to set up billing.';
        } else if (error.message.includes('Authentication required')) {
          errorMessage = 'Please sign out and sign back in to continue with checkout.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Stripe checkout function not found. The edge function may not be deployed properly.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. This is likely a Stripe configuration issue (check your secret key).';
        }
      }
      
      toast({
        title: "Checkout Error",
        description: `${errorMessage}\n\nTechnical details: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        ? 'bg-gradient-to-b from-blue-500/20 to-violet-500/20 border-2 border-blue-400 shadow-2xl shadow-blue-400/50' 
        : 'bg-white/5 border border-white/10 hover:bg-white/10'
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
              : 'bg-white/10'
          }`}>
            <Zap className={`h-8 w-8 ${popular ? 'text-white' : 'text-blue-400'}`} />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-white mb-2">{product.name}</CardTitle>
        <CardDescription className="text-slate-300 text-lg leading-relaxed">
          {getDescriptionByPlan(product.name)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow px-8">
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold text-white">${product.price}</span>
            <span className="text-slate-400 ml-2 text-xl">
              /{product.interval}
            </span>
          </div>
          <p className="text-slate-400 mt-2">per team member</p>
        </div>
        
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-slate-300 ml-3 leading-relaxed">{feature}</span>
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
              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
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
          ) : user ? (
            'Start Free Trial'
          ) : (
            'Sign Up to Continue'
          )}
        </Button>
        {!isCurrentPlan && (
          <p className="text-center text-slate-400 text-sm mt-3">
            14-day free trial • No credit card required
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

const getDescriptionByPlan = (planName: string): string => {
  const descriptions = {
    starter: 'Perfect for small teams getting started with compliance automation',
    growth: 'For growing teams with increasing compliance needs and advanced features',
    business: 'For organizations with complex compliance requirements and enterprise features'
  };

  return descriptions[planName.toLowerCase() as keyof typeof descriptions] || '';
};

const getFeaturesByPlan = (planName: string): string[] => {
  const features = {
    starter: [
      'Up to 3 team members',
      'Slack & GitHub integration',
      '1,000 requests per month',
      '100,000 tokens per month',
      'Basic compliance reports',
      'Email support',
      'Core policy templates'
    ],
    growth: [
      'Up to 10 team members',
      'Slack & GitHub integration',
      '5,000 requests per month',
      '500,000 tokens per month',
      'Advanced compliance reports',
      'Priority email support',
      'Custom policies & rules',
      'Advanced analytics dashboard',
      'API access'
    ],
    business: [
      'Unlimited team members',
      'All integrations included',
      '50,000 requests per month',
      '5,000,000 tokens per month',
      'Custom compliance reports',
      'Priority support & phone',
      'Custom policies & workflows',
      'Advanced analytics & insights',
      'Full API access',
      'Dedicated account manager',
      'Custom integrations',
      'SSO & advanced security'
    ]
  };

  return features[planName.toLowerCase() as keyof typeof features] || [];
};

export default PricingCard;