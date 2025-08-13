import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Star, Zap } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: {
        'Widget Displays': '2,000/mo',
        'Review Storage': '20 reviews',
        'Email Requests': '20/mo',
        'Widget Types': '1 type',
        'Templates': '2 basic',
        'Branding': 'Required',
        'Analytics': 'Basic',
        'Support': 'Email only',
        'A/B Testing': false,
        'Custom CSS': false,
        'API Access': false,
        'Multi-store': false
      },
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Starter',
      price: { monthly: 9, yearly: 7.2 },
      description: 'Great for growing stores',
      features: {
        'Widget Displays': '20,000/mo',
        'Review Storage': '100 reviews',
        'Email Requests': '100/mo',
        'Widget Types': '2 types',
        'Templates': '4 templates',
        'Branding': 'Optional',
        'Analytics': 'Standard',
        'Support': 'Email + Chat',
        'A/B Testing': false,
        'Custom CSS': false,
        'API Access': false,
        'Multi-store': false
      },
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 24, yearly: 19.2 },
      description: 'Best for established businesses',
      features: {
        'Widget Displays': '100,000/mo',
        'Review Storage': 'Unlimited',
        'Email Requests': 'Unlimited',
        'Widget Types': 'All types',
        'Templates': 'All templates',
        'Branding': 'Removable',
        'Analytics': 'Advanced',
        'Support': 'Priority',
        'A/B Testing': true,
        'Custom CSS': 'Limited',
        'API Access': false,
        'Multi-store': false
      },
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Premium',
      price: { monthly: 49, yearly: 39.2 },
      description: 'For agencies and large stores',
      features: {
        'Widget Displays': 'Unlimited',
        'Review Storage': 'Unlimited',
        'Email Requests': 'Unlimited',
        'Widget Types': 'All types + Custom',
        'Templates': 'All + Custom CSS',
        'Branding': 'White-label',
        'Analytics': 'Advanced + API',
        'Support': 'Dedicated success',
        'A/B Testing': true,
        'Custom CSS': 'Full access',
        'API Access': 'Full API',
        'Multi-store': true
      },
      cta: 'Start Free Trial',
      popular: false
    }
  ];

  return (
    <div className="py-20 bg-gray-50 min-h-screen page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your business. Start free and upgrade as you grow.
            All plans include our core features and 24/7 support.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                20% off
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl focus-within:shadow-xl hover:scale-105 focus-within:scale-105 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">
                      ${billingCycle === 'yearly' ? (plan.price.yearly * 12).toFixed(0) : plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {billingCycle === 'yearly' ? '/year' : '/month'}
                    </span>
                    {billingCycle === 'yearly' && plan.price.yearly < plan.price.monthly && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save ${((plan.price.monthly - plan.price.yearly) * 12).toFixed(0)}/year
                      </div>
                    )}
                  </div>

                  <Link
                    to="/onboarding"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 block text-center ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {Object.entries(plan.features).map(([feature, value]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{feature}</span>
                      <div className="flex items-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.'
              },
              {
                question: 'What happens to my data if I downgrade?',
                answer: 'Your data is always safe. If you downgrade, you\'ll still have access to all your reviews, but some premium features may be disabled.'
              },
              {
                question: 'Do you offer refunds?',
                answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, we\'ll provide a full refund.'
              },
              {
                question: 'Is there a setup fee?',
                answer: 'No setup fees, ever. You only pay for your chosen plan, and you can start with our free tier to test everything out.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Our team is here to help you choose the perfect plan for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Sales
            </Link>
            <Link
              to="/demo"
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
             Interactive Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};