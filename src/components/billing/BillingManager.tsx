import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useApiAuth } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import Footer from '../Footer';
import { Link } from 'react-router-dom';

interface BillingInfo {
  customer_id: string;
  subscription_id: string;
  current_plan: 'starter' | 'growth' | 'business';
  status: string;
  trial_end: string | null;
  current_period_end: string;
  overage_amount: number;
}

interface PlanConfig {
  name: string;
  price: number;
  requests_limit: number;
  tokens_limit: number;
  features: string[];
}

const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name: 'Starter',
    price: 30,
    requests_limit: 1000,
    tokens_limit: 100000,
    features: ['1,000 API requests/month', '100K tokens/month', 'Basic support']
  },
  growth: {
    name: 'Growth',
    price: 75,
    requests_limit: 5000,
    tokens_limit: 500000,
    features: ['5,000 API requests/month', '500K tokens/month', 'Priority support', 'Advanced analytics']
  },
  business: {
    name: 'Business',
    price: 300,
    requests_limit: 50000,
    tokens_limit: 5000000,
    features: ['50,000 API requests/month', '5M tokens/month', '24/7 support', 'Custom integrations', 'Dedicated account manager']
  }
};

const BillingManager: React.FC = () => {
  const { user } = useUser();
  const { getAuthHeaders, isSignedIn } = useApiAuth();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);



  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = await getAuthHeaders();
      
      // Create request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.BILLING), {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Billing info failed: ${response.status} - ${errorText}`);
      }

      const data: BillingInfo = await response.json();
      setBillingInfo(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please refresh the page.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch billing info');
      }
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: string) => {
    try {
      // Check if this is a downgrade
      const planHierarchy = { starter: 1, growth: 2, business: 3 };
      const currentPlanLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
      const selectedPlanLevel = planHierarchy[plan as keyof typeof planHierarchy] || 0;
      
      if (currentPlanLevel > selectedPlanLevel) {
        // This is a downgrade - show confirmation
        const confirmed = window.confirm(
          `You're downgrading from ${currentPlan} to ${plan}. The change will take effect at your next billing cycle. Continue?`
        );
        if (!confirmed) return;
      }

      // Set loading state immediately for better UX
      setActionLoading(`checkout-${plan}`);
      
      // Pre-fetch auth headers to avoid delay
      const headers = await getAuthHeaders();
      
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
      
      if (!data.checkout_url) {
        throw new Error('No checkout URL received from server');
      }

      // Immediate redirect for better performance
      window.location.href = data.checkout_url;
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Checkout request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create checkout session');
      }
      setActionLoading(null);
    }
  };

  const openBillingPortal = async () => {
    try {
      setActionLoading('portal');
      
      const headers = await getAuthHeaders();
      
      // Create portal request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.BILLING}/portal`), {
        method: 'POST',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Portal request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.portal_url) {
        throw new Error('No portal URL received from server');
      }

      // Open portal immediately
      window.open(data.portal_url, '_blank');
      setActionLoading(null);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Portal request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      }
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchBillingInfo();
    } else {
      setError('Please sign in to access billing information');
      setLoading(false);
    }
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to access your billing information.
          </p>
          <Button onClick={() => window.location.href = '/sign-in'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const currentPlan = billingInfo?.current_plan || 'starter';
  const currentPlanConfig = PLAN_CONFIGS[currentPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/50 to-slate-900/20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 mb-4">
              <Link to="/">
                <span className="flex items-center">
                  <span className="w-8 h-8 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mr-2">
                    <span className="text-white font-bold">A</span>
                  </span>
                  <span className="text-blue-300 text-sm font-medium">Billing & Subscription</span>
                </span>
              </Link>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Manage your subscription</h2>
            <p className="text-slate-300 max-w-xl">Upgrade, downgrade, or manage your billing details. All plans include secure payment and instant access.</p>
          </div>
          {billingInfo?.subscription_id && (
            <Button
              onClick={openBillingPortal}
              disabled={actionLoading === 'portal'}
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-6 py-3 shadow-lg border-0"
            >
              {actionLoading === 'portal' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Manage Billing
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Plan Card */}
        <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              Current Plan
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your current subscription details and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{currentPlanConfig.name}</h3>
                <p className="text-slate-300 text-lg">${currentPlanConfig.price}/month</p>
              </div>
              <Badge className={`text-sm font-medium ${billingInfo?.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-700/60 text-slate-300 border border-slate-600/50'}`}>{billingInfo?.status || 'No subscription'}</Badge>
            </div>

            {billingInfo?.trial_end && (
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <p className="text-sm text-blue-300">
                  Trial ends: {new Date(billingInfo.trial_end).toLocaleDateString()}
                </p>
              </div>
            )}

            {billingInfo?.current_period_end && (
              <p className="text-sm text-slate-400">
                Next billing date: {new Date(billingInfo.current_period_end).toLocaleDateString()}
              </p>
            )}

            {billingInfo?.overage_amount > 0 && (
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <p className="text-sm text-yellow-300">
                  Overage charges: ${billingInfo.overage_amount.toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(PLAN_CONFIGS).map(([planKey, plan]) => (
              <Card key={planKey} className={`relative bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 ${planKey === currentPlan ? 'ring-2 ring-blue-500 shadow-blue-500/30' : ''}`}>
                {planKey === currentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-violet-500 text-white px-4 py-1 text-sm font-medium shadow-lg">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mb-4">
                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${planKey === currentPlan ? 'bg-gradient-to-r from-blue-400 to-violet-400 shadow-lg shadow-blue-400/30' : 'bg-slate-700/60 border border-slate-600/50'}`}>
                      <CreditCard className={`h-7 w-7 ${planKey === currentPlan ? 'text-white' : 'text-blue-300'}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-lg leading-relaxed text-slate-300">
                    ${plan.price}/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow px-6 pb-8">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-300">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {planKey === currentPlan ? (
                    <Button disabled className="w-full bg-green-500/20 border border-green-500/50 text-green-400 cursor-not-allowed">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => createCheckoutSession(planKey)}
                      disabled={actionLoading === `checkout-${planKey}`}
                      className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0 py-5 text-lg font-medium"
                    >
                      {actionLoading === `checkout-${planKey}` ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {(() => {
                        const planHierarchy = { starter: 1, growth: 2, business: 3 };
                        const currentPlanLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
                        const selectedPlanLevel = planHierarchy[planKey as keyof typeof planHierarchy] || 0;
                        if (currentPlanLevel > selectedPlanLevel) {
                          return 'Downgrade';
                        } else if (currentPlanLevel < selectedPlanLevel) {
                          return 'Upgrade';
                        } else {
                          return billingInfo?.subscription_id ? 'Switch Plan' : 'Start Plan';
                        }
                      })()}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BillingManager; 