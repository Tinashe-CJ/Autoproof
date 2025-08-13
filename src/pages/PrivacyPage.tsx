import React from 'react';
import { Shield, Eye, Lock, Download } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const lastUpdated = 'January 15, 2024';

  return (
    <div className="py-20 bg-white min-h-screen page-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-blue-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Privacy at a Glance
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Eye className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Data Minimization</h3>
                <p className="text-sm text-gray-600">We only collect data necessary for our service</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Lock className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Secure Storage</h3>
                <p className="text-sm text-gray-600">All data is encrypted and securely stored</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Download className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Your Control</h3>
                <p className="text-sm text-gray-600">Export or delete your data anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Autoproof ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using Autoproof, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our policies and practices, do not use our service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Account information (name, email, company details)</li>
              <li>Shopify store information and access credentials</li>
              <li>Widget configuration preferences</li>
              <li>Customer support communications</li>
              <li>Billing and payment information (processed by Stripe)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              2.2 Information We Collect Automatically
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Usage analytics and performance metrics</li>
              <li>Device information and browser data</li>
              <li>IP addresses and location data</li>
              <li>Widget interaction data</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              2.3 Customer Review Data
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Customer names (automatically anonymized)</li>
              <li>Review text and ratings</li>
              <li>Product information</li>
              <li>Review timestamps and verification status</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Process transactions and billing</li>
              <li>Send service-related communications</li>
              <li>Improve our products and services</li>
              <li>Provide customer support</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
            </p>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              4.1 Service Providers
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share information with trusted third-party service providers who assist us in operating our service:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Hosting providers (secure cloud infrastructure)</li>
              <li>Payment processors (Stripe for billing)</li>
              <li>Email service providers (for transactional emails)</li>
              <li>Analytics providers (aggregated data only)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              4.2 Legal Requirements
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We may disclose your information if required by law or in response to valid legal requests by public authorities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>End-to-end encryption for data transmission</li>
              <li>Encrypted storage of sensitive information</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Staff training on data protection</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Your Privacy Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">GDPR Rights (EU Users)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing for legitimate interests</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">CCPA Rights (California Users)</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Know what personal information we collect and how it's used</li>
                <li>Delete personal information we have collected</li>
                <li>Opt-out of the sale of personal information (we don't sell data)</li>
                <li>Non-discrimination for exercising your privacy rights</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Account information: Until account deletion</li>
              <li>Review data: 3 years after account closure</li>
              <li>Usage analytics: 2 years (anonymized)</li>
              <li>Financial records: 7 years (legal requirement)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our servers are located in the United States. If you are accessing our service from outside the US, 
              your information may be transferred to, stored, and processed in the US. We ensure adequate protection 
              through appropriate safeguards and compliance with applicable data protection laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If we become aware that we have collected personal information 
              from a child under 13, we will delete such information immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending email notification for material changes</li>
              <li>Displaying a notice in your dashboard</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or want to exercise your privacy rights, 
              please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@autoproof.com</p>
              <p className="text-gray-700 mb-2"><strong>Address:</strong> 123 Business Ave, Suite 100, San Francisco, CA 94105</p>
              <p className="text-gray-700"><strong>Response Time:</strong> We respond to all privacy requests within 30 days</p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-blue-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions about our privacy practices?
          </h2>
          <p className="text-blue-100 mb-6">
            Our team is here to help you understand how we protect your data.
          </p>
          <a
            href="/contact"
            className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Contact Our Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
};