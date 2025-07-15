import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import PricingCard from './PricingCard';
import { stripeProducts } from '@/stripe-config';
import { getUserSubscription } from '@/lib/supabase';
import { getProductByPriceId } from '@/stripe-config';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const { user } = useUser();
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          const { data: subscription } = await getUserSubscription();
          if (subscription?.price_id) {
            const product = getProductByPriceId(subscription.price_id);
            setCurrentPlan(product?.name || '');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/30 to-slate-900/0" />

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="font-bold text-2xl text-white">AutoProof</span>
              </div>
            </div>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 mb-6">
              <Star className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-blue-300 text-sm font-medium">14-day free trial included</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Simple, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Transparent</span> Pricing
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Choose the plan that fits your team's compliance needs. All plans
              include AI-powered monitoring and real-time alerts.
            </p>
            {currentPlan && (
              <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                <Check className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-green-300 text-sm font-medium">
                  Current plan: {currentPlan}
                </span>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {stripeProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <PricingCard
                  product={product}
                  popular={product.name === 'Growth'}
                  currentPlan={currentPlan}
                />
              </motion.div>
            ))}
          </div>

          {/* Features Comparison */}
          <motion.div
            className="mt-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              All Plans Include
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                'AI-Powered Detection',
                'Real-time Monitoring',
                'Slack Integration',
                'GitHub Integration',
                'Compliance Reports',
                'Email Notifications',
                'Dashboard Analytics',
                'API Access'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-slate-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            className="mt-20 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Questions?
            </h3>
            <p className="text-slate-300 mb-8 text-lg">
              Need a custom plan or have questions about our pricing?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-8 py-6 h-auto"
              >
                Contact Sales
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/20 hover:border-white/60 px-8 py-6 h-auto bg-white/5"
              >
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;