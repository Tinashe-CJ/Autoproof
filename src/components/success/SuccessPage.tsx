import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { getUserSubscription } from '@/lib/supabase';
import { getProductByPriceId } from '@/stripe-config';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data } = await getUserSubscription();
        setSubscription(data);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const getPlanName = () => {
    if (!subscription?.price_id) return 'Your Plan';
    
    const product = getProductByPriceId(subscription.price_id);
    return product?.name || 'Your Plan';
  };

  const getPlanPrice = () => {
    if (!subscription?.price_id) return null;
    
    const product = getProductByPriceId(subscription.price_id);
    return product ? `$${product.price}/month` : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Thank you for subscribing to AutoProof
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Processing your subscription...</p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Welcome to {getPlanName()}!</h3>
              {getPlanPrice() && (
                <p className="text-sm text-muted-foreground">{getPlanPrice()}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Your subscription is now active and you have access to all features in your plan.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground">
                  Session ID: {sessionId}
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">What's next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Access your dashboard to get started</li>
              <li>• Connect your Slack and GitHub integrations</li>
              <li>• Configure your compliance policies</li>
              <li>• Start monitoring for violations</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-2 pt-4">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;