import React, { useState } from 'react';
import { Cookie, Shield, BarChart3, Settings } from 'lucide-react';

export const CookiePage: React.FC = () => {
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false
  });

  const lastUpdated = 'January 15, 2024';

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'necessary') return; // Necessary cookies can't be disabled
    setPreferences(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const cookieTypes = [
    {
      id: 'necessary',
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. Cannot be disabled.',
      icon: Shield,
      required: true,
      examples: ['Authentication tokens', 'Security settings', 'Load balancing']
    },
    {
      id: 'functional',
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization.',
      icon: Settings,
      required: false,
      examples: ['Language preferences', 'Theme settings', 'Dashboard layout']
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      icon: BarChart3,
      required: false,
      examples: ['Google Analytics', 'Page views', 'User behavior patterns']
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements and track campaign effectiveness.',
      icon: Cookie,
      required: false,
      examples: ['Ad targeting', 'Conversion tracking', 'Social media integration']
    }
  ];

  return (
    <div className="py-20 bg-white min-h-screen page-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
            <Cookie className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Cookie Preferences Panel */}
        <div className="bg-blue-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Cookie Preferences
          </h2>
          <p className="text-gray-700 mb-6">
            Customize your cookie preferences below. You can change these settings at any time, 
            but disabling some cookies may affect your experience.
          </p>
          
          <div className="space-y-6">
            {cookieTypes.map((type) => (
              <div key={type.id} className="bg-white rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <type.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{type.title}</h3>
                      <p className="text-gray-600 mb-3">{type.description}</p>
                      <div className="text-sm text-gray-500">
                        <strong>Examples:</strong> {type.examples.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[type.id as keyof typeof preferences]}
                        onChange={() => handlePreferenceChange(type.id as keyof typeof preferences)}
                        disabled={type.required}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${type.required ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      {type.required && (
                        <span className="ml-2 text-xs text-gray-500">Required</span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={() => alert('Cookie preferences saved!')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Policy Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. What Are Cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are stored on your device when you visit a website. 
              They help websites remember information about your visit, such as your language preference 
              and other settings, which can make your next visit easier and the site more useful to you.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cookies play an important role in enhancing your user experience and helping us provide 
              better services. This policy explains how Autoproof uses cookies and similar technologies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. How We Use Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies for several purposes:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Essential Functions</h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• User authentication and security</li>
                  <li>• Remembering your preferences</li>
                  <li>• Maintaining your session</li>
                  <li>• Preventing fraud and abuse</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Service Improvement</h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• Understanding how you use our service</li>
                  <li>• Analyzing performance and errors</li>
                  <li>• Personalizing your experience</li>
                  <li>• Optimizing our features</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Types of Cookies We Use
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              3.1 First-Party Cookies
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These are cookies set directly by Autoproof when you visit our website. 
              We use these cookies for essential functions and to improve your experience.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              3.2 Third-Party Cookies
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These are cookies set by third-party services we use, such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Google Analytics:</strong> To understand website usage and performance</li>
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Intercom:</strong> For customer support chat functionality</li>
              <li><strong>Shopify Partners:</strong> For app store integration and authentication</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              3.3 Session vs. Persistent Cookies
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Cookies</h4>
                  <p className="text-gray-700 text-sm">
                    Temporary cookies that expire when you close your browser. 
                    Used for essential functions like maintaining your login session.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Persistent Cookies</h4>
                  <p className="text-gray-700 text-sm">
                    Remain on your device for a set period or until manually deleted. 
                    Used to remember your preferences across visits.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Your Cookie Choices
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              4.1 Browser Settings
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Delete cookies when you close your browser</li>
              <li>Get notified when cookies are set</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              4.2 Our Cookie Settings
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Use the cookie preference panel above to customize which types of cookies you allow. 
              Your choices will be remembered for future visits.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              4.3 Impact of Disabling Cookies
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-amber-800 text-sm">
                <strong>Please note:</strong> Disabling certain cookies may limit your ability to use 
                some features of our service. For example, disabling functional cookies may reset your 
                preferences each time you visit, and disabling necessary cookies may prevent you from 
                logging in or accessing secure areas.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Cookie Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Different cookies have different retention periods:
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cookie Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Session cookies</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Until browser is closed</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Authentication cookies</td>
                    <td className="px-6 py-4 text-sm text-gray-700">30 days</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Preference cookies</td>
                    <td className="px-6 py-4 text-sm text-gray-700">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Analytics cookies</td>
                    <td className="px-6 py-4 text-sm text-gray-700">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Updates to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any material 
              changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Updating the "Last updated" date at the top of this policy</li>
              <li>Displaying a notice on our website</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@autoproof.com</p>
              <p className="text-gray-700 mb-2"><strong>Subject:</strong> Cookie Policy Inquiry</p>
              <p className="text-gray-700"><strong>Response Time:</strong> We respond within 48 hours</p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-blue-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions about our cookie practices?
          </h2>
          <p className="text-blue-100 mb-6">
            Our privacy team is here to help you understand how we use cookies to improve your experience.
          </p>
          <a
            href="/contact"
            className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Contact Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
};