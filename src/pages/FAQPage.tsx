import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How long does it take to set up Autoproof?',
          answer: 'Most merchants have Autoproof running on their store within 5 minutes. Our one-click installation integrates seamlessly with Shopify, and you can customize your first widget in just a few clicks.'
        },
        {
          question: 'Do I need technical skills to use Autoproof?',
          answer: 'Not at all! Autoproof is designed for merchants of all technical levels. Our drag-and-drop customizer, pre-built templates, and automatic installation mean you never need to touch code.'
        },
        {
          question: 'Can I import my existing reviews?',
          answer: 'Yes! Autoproof automatically imports reviews from your Shopify store, including native Shopify reviews and reviews from most popular review apps. We also provide CSV import for custom review data.'
        },
        {
          question: 'Will widgets slow down my store?',
          answer: 'No. Our widgets are optimized for performance with lazy loading, CDN delivery, and compressed assets. Most widgets load in under 100ms and have minimal impact on your page speed scores.'
        }
      ]
    },
    {
      category: 'Features & Customization',
      questions: [
        {
          question: 'What types of widgets can I create?',
          answer: 'Autoproof offers several widget types: Inline Reviews (display on product pages), Floating Social Proof (purchase notifications), Review Carousels (rotating testimonials), and Review Badges (trust indicators). More widget types are added regularly.'
        },
        {
          question: 'Can I customize the look and feel?',
          answer: 'Absolutely! Choose from professionally designed templates, customize colors, fonts, spacing, and layouts. Pro plans include custom CSS for unlimited design control. All widgets automatically match your theme colors.'
        },
        {
          question: 'Do widgets work on mobile devices?',
          answer: 'Yes! All widgets are fully responsive and optimized for mobile, tablet, and desktop. We test on all major devices and browsers to ensure perfect compatibility.'
        },
        {
          question: 'Can I show widgets on specific products or pages?',
          answer: 'Yes! Use our targeting rules to show widgets on specific products, collections, or pages. You can also exclude certain products or create different widgets for different product categories.'
        }
      ]
    },
    {
      category: 'Email Automation',
      questions: [
        {
          question: 'How does the email automation work?',
          answer: 'After a customer makes a purchase, Autoproof automatically sends a review request email after a customizable delay (usually 3-7 days). The email includes your branding, product details, and a simple review link.'
        },
        {
          question: 'Can I customize the email templates?',
          answer: 'Yes! Customize email subject lines, content, timing, and design. You can add your logo, change colors, and personalize the message. Pro plans include advanced email customization options.'
        },
        {
          question: 'What if customers don\'t want review emails?',
          answer: 'All emails include unsubscribe links, and we automatically honor customer preferences. You can also exclude specific customers or segments from receiving review requests.'
        },
        {
          question: 'Can I offer incentives for reviews?',
          answer: 'Yes! Pro plans allow you to include discount codes or special offers in review request emails. This significantly increases response rates while building customer loyalty.'
        }
      ]
    },
    {
      category: 'Analytics & Performance',
      questions: [
        {
          question: 'What analytics do I get?',
          answer: 'Track widget impressions, clicks, conversion rates, and revenue attribution. See which reviews drive the most sales, monitor email performance, and get insights to optimize your strategy.'
        },
        {
          question: 'Can I A/B test different widgets?',
          answer: 'Yes! Pro plans include built-in A/B testing. Test different templates, colors, placements, or content to find what converts best for your audience.'
        },
        {
          question: 'How do you track conversions?',
          answer: 'We use advanced attribution modeling to track when widget interactions lead to purchases. This includes direct conversions and influenced sales, giving you a complete picture of ROI.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes! Export reviews, analytics data, and performance reports as CSV files. Pro and Premium plans include API access for advanced integrations.'
        }
      ]
    },
    {
      category: 'Privacy & Compliance',
      questions: [
        {
          question: 'Is Autoproof GDPR compliant?',
          answer: 'Yes! We\'re fully GDPR compliant with automatic data anonymization, privacy controls, and right-to-be-forgotten functionality. Customer data is protected and processed according to strict privacy standards.'
        },
        {
          question: 'How do you protect customer privacy?',
          answer: 'We automatically anonymize customer names (e.g., "Sarah M."), never display full personal information, and provide easy opt-out options. All data is encrypted and stored securely.'
        },
        {
          question: 'Can customers request data deletion?',
          answer: 'Yes! Customers can request data deletion through your store or directly through us. We provide one-click data export and deletion tools to comply with privacy regulations.'
        },
        {
          question: 'Where is data stored?',
          answer: 'All data is stored on secure, encrypted servers in compliance with international data protection standards. We use industry-leading security practices and regular security audits.'
        }
      ]
    },
    {
      category: 'Billing & Plans',
      questions: [
        {
          question: 'How does the free plan work?',
          answer: 'Our free plan includes 2,000 widget displays per month, 20 review storage, and basic email automation. Perfect for small stores getting started with social proof.'
        },
        {
          question: 'What happens if I exceed my plan limits?',
          answer: 'If you exceed display limits, widgets will show a gentle upgrade prompt instead of reviews. Your data is always safe, and upgrading immediately restores full functionality.'
        },
        {
          question: 'Can I change plans anytime?',
          answer: 'Yes! Upgrade or downgrade anytime with immediate effect. We prorate charges and never lock you into long-term contracts. Cancel anytime with one click.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'Yes! We offer a 30-day money-back guarantee for all paid plans. If you\'re not completely satisfied, contact us for a full refund, no questions asked.'
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="py-20 bg-gray-50 min-h-screen page-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions about Autoproof. 
            Can't find what you're looking for? We're here to help.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFaqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {category.category}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {category.questions.map((faq, index) => {
                  const globalIndex = categoryIndex * 100 + index;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 pr-8">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4 animate-slide-up">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFaqs.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any FAQs matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <MessageCircle className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Still need help?
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Our support team is here to help you succeed. Get personalized assistance 
              from real people who know Autoproof inside and out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/demo"
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Interactive Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};