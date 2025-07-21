import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserSubscription } from '@/lib/supabase';
import { getProductByPriceId } from '@/stripe-config';
import { 
  User, 
  LogOut, 
  CreditCard, 
  Settings, 
  Loader2, 
  Zap, 
  Shield, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Star,
  Calendar,
  Users,
  Key
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApiAuth } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/config/api';
import Footer from '../Footer';

const Dashboard = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getAuthHeaders, isSignedIn } = useApiAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user && isSignedIn) {
          const headers = await getAuthHeaders();
          const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.BILLING), {
            headers,
          });

          if (response.ok) {
            const data = await response.json();
            setSubscription(data);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, isSignedIn, getAuthHeaders]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getCurrentPlan = () => {
    if (!subscription?.current_plan) return 'Free';
    
    // Capitalize the first letter to match the plan names
    const planName = subscription.current_plan.charAt(0).toUpperCase() + subscription.current_plan.slice(1);
    return planName;
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

    return statusMap[subscription.status] || subscription.status;
  };

  const getPlanPrice = () => {
    if (!subscription?.current_plan) return 'Free';
    
    const planPrices = {
      'starter': 30,
      'growth': 75,
      'business': 300
    };
    
    const price = planPrices[subscription.current_plan as keyof typeof planPrices];
    return price ? `$${price}/month` : 'Free';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'trialing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'past_due':
      case 'unpaid':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'canceled':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/50 to-slate-900/20" />

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm">Welcome back, {user?.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                className={`text-sm font-medium ${
                  getCurrentPlan() !== 'Free' 
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-slate-700/60 text-slate-300 border border-slate-600/50'
                }`}
              >
                <Star className="h-3 w-3 mr-1" />
                {getCurrentPlan()}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/user-profile')}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Current Plan</p>
                  <p className="text-2xl font-bold text-white mt-1">{getCurrentPlan()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold text-white mt-1">{getSubscriptionStatus()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Monthly Cost</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {getPlanPrice().replace('/month', '')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Team Members</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {getCurrentPlan() === 'Starter' ? '3' : getCurrentPlan() === 'Growth' ? '10' : '∞'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account & Subscription */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Overview */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-400" />
                    Account Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                      <p className="text-slate-500 text-xs">
                        Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
                      <p className="text-slate-400 text-sm font-medium">Current Plan</p>
                      <p className="text-xl font-bold text-white mt-1">{getCurrentPlan()}</p>
                      {getPlanPrice() && (
                        <p className="text-slate-400 text-sm mt-1">{getPlanPrice()}</p>
                      )}
                    </div>
                    
                    <div className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
                      <p className="text-slate-400 text-sm font-medium">Subscription Status</p>
                      <div className="flex items-center mt-1">
                        <Badge 
                          className={`text-xs ${getStatusColor(getSubscriptionStatus())}`}
                        >
                          {getSubscriptionStatus()}
                        </Badge>
                      </div>
                      {subscription?.current_period_end ? (
                        <p className="text-slate-500 text-xs mt-2">
                          Renews: {(() => {
                            try {
                              // Try to use the current_period_end from Stripe first
                              const renewalDate = new Date(subscription.current_period_end * 1000);
                              if (!isNaN(renewalDate.getTime())) {
                                return renewalDate.toLocaleDateString();
                              }
                              
                              // Fallback: calculate 30 days from now if current_period_end is invalid
                              const fallbackDate = new Date();
                              fallbackDate.setDate(fallbackDate.getDate() + 30);
                              return fallbackDate.toLocaleDateString();
                            } catch (error) {
                              // Final fallback: 30 days from now
                              const fallbackDate = new Date();
                              fallbackDate.setDate(fallbackDate.getDate() + 30);
                              return fallbackDate.toLocaleDateString();
                            }
                          })()}
                        </p>
                      ) : subscription?.status === 'active' && (
                        <p className="text-slate-500 text-xs mt-2">
                          Renews: {(() => {
                            const fallbackDate = new Date();
                            fallbackDate.setDate(fallbackDate.getDate() + 30);
                            return fallbackDate.toLocaleDateString();
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Getting Started */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-blue-400" />
                    Getting Started
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Set up your compliance automation in just a few steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        title: 'Connect Slack Workspace', 
                        description: 'Integrate with your team communication',
                        icon: Activity,
                        completed: false
                      },
                      { 
                        title: 'Link GitHub Repositories', 
                        description: 'Connect your code repositories',
                        icon: TrendingUp,
                        completed: false
                      },
                      { 
                        title: 'Configure Policies', 
                        description: 'Set up compliance rules and alerts',
                        icon: Shield,
                        completed: false
                      },
                      { 
                        title: 'Start Monitoring', 
                        description: 'Begin automated compliance checks',
                        icon: CheckCircle,
                        completed: false
                      }
                    ].map((step, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          step.completed 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-slate-600/60 border border-slate-500/50'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <step.icon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{step.title}</p>
                          <p className="text-slate-400 text-sm">{step.description}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className={`w-full justify-start ${getCurrentPlan() === 'Free' ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0'}`}
                    onClick={() => navigate(getCurrentPlan() === 'Free' ? '/pricing' : '/billing')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {getCurrentPlan() === 'Free' ? 'Choose Plan' : 'Manage Subscription'}
                  </Button>
                  
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
                    onClick={() => navigate('/violations')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Violations
                  </Button>
                  
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
                    onClick={() => navigate('/policies')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Policies
                  </Button>
                  
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
                    onClick={() => navigate('/analyze')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Analysis Playground
                  </Button>
                  
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
                    onClick={() => navigate('/api-keys')}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    API Keys
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-400" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-3"></div>
                      <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">API Status</span>
                      <span className="text-green-400">✓ Online</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Database</span>
                      <span className="text-green-400">✓ Online</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Monitoring</span>
                      <span className="text-green-400">✓ Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Account created</p>
                        <p className="text-slate-500 text-xs">Just now</p>
                      </div>
                    </div>
                    
                    {getCurrentPlan() !== 'Free' && (
                      <div className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">Subscription activated</p>
                          <p className="text-slate-500 text-xs">Today</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;