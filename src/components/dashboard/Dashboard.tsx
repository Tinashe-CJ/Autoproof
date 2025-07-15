import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserSubscription } from '@/lib/supabase';
import { getProductByPriceId } from '@/stripe-config';
import { User, LogOut, CreditCard, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          const { data: subscriptionData } = await getUserSubscription();
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getCurrentPlan = () => {
    if (!subscription?.price_id) return 'Free';
    
    const product = getProductByPriceId(subscription.price_id);
    return product?.name || 'Unknown';
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'No subscription';
    
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'trialing': 'Trial',
      'past_due': 'Past Due',
      'canceled': 'Canceled',
      'incomplete': 'Incomplete',
      'not_started': 'Not Started',
      'unpaid': 'Unpaid',
      'paused': 'Paused'
    };

    return statusMap[subscription.subscription_status] || subscription.subscription_status;
  };

  const getPlanPrice = () => {
    if (!subscription?.price_id) return null;
    
    const product = getProductByPriceId(subscription.price_id);
    return product ? `$${product.price}/month` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">A</span>
              </div>
              <h1 className="text-xl font-semibold">AutoProof Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {getCurrentPlan()}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => navigate('/user-profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account</CardTitle>
              <User className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.emailAddresses[0]?.emailAddress}</div>
              <p className="text-xs text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <CreditCard className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCurrentPlan()}</div>
              {getPlanPrice() && (
                <p className="text-sm text-muted-foreground">{getPlanPrice()}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Status: {getSubscriptionStatus()}
              </p>
              {subscription?.current_period_end && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renews: {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Settings className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate('/pricing')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to AutoProof, {user?.firstName}!</CardTitle>
              <CardDescription>
                Your AI-powered compliance automation platform is ready to help you maintain compliance without slowing down development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Getting Started</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Connect your Slack workspace</li>
                    <li>• Integrate with GitHub repositories</li>
                    <li>• Configure compliance policies</li>
                    <li>• Start monitoring for violations</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Current Plan: {getCurrentPlan()}</h4>
                  <p className="text-sm text-muted-foreground">
                    {getCurrentPlan() === 'Free' 
                      ? 'Upgrade to unlock advanced features and higher limits.'
                      : 'You have access to all features in your current plan.'
                    }
                  </p>
                  {getCurrentPlan() === 'Free' && (
                    <Button size="sm" onClick={() => navigate('/pricing')}>
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;