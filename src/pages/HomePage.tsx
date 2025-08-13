import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Zap, Shield, TrendingUp, ArrowRight, PlayCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2" />
                Trusted by 1,000+ Shopify merchants
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Beautiful social proof 
                <span className="text-blue-600"> widgets</span> that 
                <span className="text-blue-600"> sell</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Install gorgeous, customizable review widgets on your Shopify store in under 5 minutes. 
                Boost customer trust and increase conversions with authentic social proof.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/onboarding" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  to="/demo" 
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border border-gray-300 transition-all duration-200 flex items-center justify-center"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  View Live Demo
                </Link>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  No credit card required
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  5-minute setup
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  GDPR compliant
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              {/* Hero Demo Widget */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        S
                      </div>
                      <div>
                        <div className="font-semibold">Sarah M.</div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">
                      "This product exceeded my expectations! Fast shipping and amazing quality. 
                      Will definitely order again."
                    </p>
                    <div className="text-sm text-gray-500">
                      Verified purchase • 2 hours ago
                    </div>
                  </div>
                </div>
                
                {/* Floating notification */}
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform -rotate-2">
                  <div className="text-sm font-semibold">+12% conversions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 mb-8">
            Trusted by leading Shopify merchants worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E', 'Brand F'].map((brand, index) => (
              <div key={index} className="text-center">
                <div className="h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-gray-600">{brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to build trust
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for Shopify merchants who want to 
              increase conversions with authentic social proof.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: '5-Minute Setup',
                description: 'Install and customize beautiful widgets in minutes, not hours. No coding required.',
                color: 'bg-yellow-100 text-yellow-600'
              },
              {
                icon: Star,
                title: 'Automatic Reviews',
                description: 'Import existing reviews and automatically collect new ones with smart email flows.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'GDPR compliant with customer data anonymization and privacy controls built-in.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: TrendingUp,
                title: 'Proven Results',
                description: 'Merchants see an average 15% increase in conversions within 30 days.',
                color: 'bg-purple-100 text-purple-600'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-6`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What merchants are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Alex Chen',
                role: 'Founder, TechWear Co.',
                content: 'Autoproof increased our conversion rate by 18% in the first month. The widgets look amazing and setup was incredibly easy.',
                rating: 5
              },
              {
                name: 'Maria Rodriguez',
                role: 'Marketing Director, Beauty Bliss',
                content: 'The automated email flows are a game-changer. We\'re collecting 3x more reviews now without any extra effort.',
                rating: 5
              },
              {
                name: 'James Wilson',
                role: 'Owner, Outdoor Gear Plus',
                content: 'Love how the widgets match our brand perfectly. Customer trust has visibly improved since we installed Autoproof.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to increase your conversions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of merchants who trust Autoproof to showcase their customer reviews and boost sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/onboarding" 
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/demo" 
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              View Demo
            </Link>
            <Link 
              to="/onboarding" 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Install This Widget
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};