import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
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
    return product ? `$${product.price.toFixed(2)}/month` : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/30 to-slate-900/0" />
      
      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-md border border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 mb-6 shadow-lg shadow-green-500/25">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            Thank you for subscribing to AutoProof
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-slate-300 text-lg">Processing your subscription...</p>
              <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="font-bold text-2xl text-white mb-2">Welcome to {getPlanName()}!</h3>
                {getPlanPrice() && (
                  <p className="text-blue-300 text-lg font-medium">{getPlanPrice()}</p>
                )}
                <p className="text-slate-300 mt-3">
                  Your subscription is now active. You can start monitoring your compliance immediately.
                </p>
              </div>
              
              {sessionId && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-xs text-slate-400">
                    Session ID: <span className="font-mono">{sessionId}</span>
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h4 className="font-semibold text-white text-lg mb-4">What's next?</h4>
            <ul className="text-slate-300 space-y-3">
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></div>
                Access your dashboard to configure settings
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></div>
                Connect your Slack and GitHub integrations
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></div>
                Set up your compliance monitoring rules
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></div>
                Begin automated compliance scanning
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium py-6 text-lg"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full border-white/20 text-white hover:bg-white/10 py-6"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;