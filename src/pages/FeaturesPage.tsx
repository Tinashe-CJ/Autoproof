import React from 'react';
import { 
  Star, 
  Zap, 
  Shield, 
  TrendingUp, 
  Mail, 
  Palette, 
  BarChart3, 
  Settings,
  Smartphone,
  Eye,
  Clock,
  Globe
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      category: 'Core Features',
      items: [
        {
          icon: Zap,
          title: 'Instant Setup',
          description: 'Get up and running in under 5 minutes with our one-click Shopify installation. No coding required.',
          benefits: ['One-click installation', 'Auto-import existing reviews', 'Smart theme integration']
        },
        {
          icon: Star,
          title: 'Beautiful Widgets',
          description: 'Stunning, customizable review widgets that match your brand and convert visitors into customers.',
          benefits: ['Multiple widget types', 'Brand customization', 'Mobile-responsive design']
        },
        {
          icon: Mail,
          title: 'Email Automation',
          description: 'Automatically collect reviews with smart email campaigns triggered by customer purchases.',
          benefits: ['Post-purchase automation', 'Custom email templates', 'Delivery tracking']
        }
      ]
    },
    {
      category: 'Customization',
      items: [
        {
          icon: Palette,
          title: 'Design System',
          description: 'Match your exact brand with our powerful customization engine and template library.',
          benefits: ['Color customization', 'Font selection', 'Layout options', 'CSS overrides']
        },
        {
          icon: Settings,
          title: 'Widget Controls',
          description: 'Fine-tune every aspect of your widgets with granular control over display and behavior.',
          benefits: ['Display rules', 'Timing controls', 'Product targeting', 'Page placement']
        }
      ]
    },
    {
      category: 'Analytics & Insights',
      items: [
        {
          icon: BarChart3,
          title: 'Performance Analytics',
          description: 'Track widget performance, conversion impact, and customer engagement with detailed analytics.',
          benefits: ['Conversion tracking', 'Revenue attribution', 'A/B testing', 'Export reports']
        },
        {
          icon: TrendingUp,
          title: 'Growth Insights',
          description: 'Understand what drives conversions and optimize your social proof strategy.',
          benefits: ['Performance insights', 'Optimization tips', 'Trend analysis', 'Benchmarking']
        }
      ]
    },
    {
      category: 'Trust & Compliance',
      items: [
        {
          icon: Shield,
          title: 'Privacy Protection',
          description: 'GDPR compliant with built-in privacy controls and customer data anonymization.',
          benefits: ['GDPR compliance', 'Data anonymization', 'Privacy controls', 'Secure hosting']
        },
        {
          icon: Eye,
          title: 'Review Moderation',
          description: 'Smart moderation tools to ensure quality and authenticity of displayed reviews.',
          benefits: ['Spam detection', 'Manual moderation', 'Quality filters', 'Verification badges']
        }
      ]
    }
  ];

  const widgetTypes = [
    {
      name: 'Inline Reviews',
      description: 'Display customer reviews directly on product pages',
      image: '/api/placeholder/400/300',
      features: ['Star ratings', 'Review text', 'Customer photos', 'Verified badges']
    },
    {
      name: 'Floating Popups',
      description: 'Non-intrusive notifications showing recent purchases',
      image: '/api/placeholder/400/300',
      features: ['Real-time updates', 'Smart timing', 'Mobile optimized', 'Custom animations']
    },
    {
      name: 'Review Carousel',
      description: 'Rotating showcase of your best customer reviews',
      image: '/api/placeholder/400/300',
      features: ['Swipeable interface', 'Auto-rotation', 'Featured reviews', 'Responsive design']
    }
  ];

  return (
    <div className="py-20 bg-white page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Powerful features for 
            <span className="text-blue-600"> every merchant</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to showcase customer reviews, build trust, and increase conversions.
            Designed specifically for Shopify merchants who want results.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {[
            { icon: Clock, stat: '<5 min', label: 'Setup Time' },
            { icon: TrendingUp, stat: '+15%', label: 'Avg Conversion Lift' },
            { icon: Globe, stat: '1,000+', label: 'Happy Merchants' },
            { icon: Smartphone, stat: '100%', label: 'Mobile Optimized' }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{item.stat}</div>
              <div className="text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Widget Types */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Widget Types
            </h2>
            <p className="text-lg text-gray-600">
              Choose from multiple widget types to match your store's style and goals
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {widgetTypes.map((widget, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm text-gray-600">Widget Preview</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{widget.name}</h3>
                  <p className="text-gray-600 mb-4">{widget.description}</p>
                  <ul className="space-y-2">
                    {widget.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Categories */}
        <div className="space-y-16">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {category.category}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((feature, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-6">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Section */}
        <div className="mt-20 bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Seamless Shopify Integration
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Built specifically for Shopify with native integration, theme compatibility, 
            and automatic synchronization with your store data.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[
              'One-click installation',
              'Auto theme detection', 
              'Real-time sync',
              'Order integration',
              'Product mapping',
              'Webhook support'
            ].map((feature, index) => (
              <div key={index} className="flex items-center text-white">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                {feature}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/onboarding"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Install Now
            </a>
            <a
              href="/demo"
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};