import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const lastUpdated = 'January 15, 2024';

  return (
    <div className="py-20 bg-white min-h-screen page-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 mb-2">Important Information</h3>
              <p className="text-amber-700 text-sm">
                Please read these Terms of Service carefully before using Autoproof. 
                By accessing or using our service, you agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your use of Autoproof ("Service") operated by Autoproof Inc. ("we," "us," or "our"). 
              By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you disagree with any part of these Terms, then you may not access the Service. 
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Autoproof provides social proof and review management tools for Shopify merchants, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Customizable review widgets for Shopify stores</li>
              <li>Automated email campaigns for review collection</li>
              <li>Review management and moderation tools</li>
              <li>Analytics and performance tracking</li>
              <li>Customer support and documentation</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Accounts and Registration
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              3.1 Account Creation
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              3.2 Account Responsibility
            </h3>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for all activities that occur under your account. We reserve the right to 
              suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Acceptable Use Policy
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              4.1 Permitted Uses
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may use the Service for legitimate business purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Displaying authentic customer reviews on your store</li>
              <li>Collecting genuine customer feedback</li>
              <li>Analyzing review performance and customer sentiment</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              4.2 Prohibited Uses
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Display false, misleading, or fabricated reviews</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit spam, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service for competitive intelligence or benchmarking</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Subscription Plans and Billing
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              5.1 Subscription Terms
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service is offered through various subscription plans. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Pay all fees associated with your chosen plan</li>
              <li>Automatic renewal unless cancelled</li>
              <li>Immediate billing upon plan upgrade</li>
              <li>Prorated billing for plan changes</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              5.2 Free Trial
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We offer a free trial period for new users. During the trial:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>No payment is required for the trial period</li>
              <li>Some features may be limited</li>
              <li>Trial converts to paid subscription unless cancelled</li>
              <li>Trial data is retained upon conversion</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              5.3 Refunds and Cancellation
            </h3>
            <p className="text-gray-700 leading-relaxed">
              You may cancel your subscription at any time. We offer a 30-day money-back guarantee 
              for first-time subscribers. Refunds are processed within 5-10 business days.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Intellectual Property Rights
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              6.1 Our IP Rights
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by Autoproof Inc. 
              and are protected by international copyright, trademark, patent, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              6.2 Your Content Rights
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain all rights to your content (reviews, store data, etc.). By using our Service, you grant us:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>License to process and display your content through the Service</li>
              <li>Right to use aggregated, anonymized data for service improvement</li>
              <li>Permission to showcase your widgets as examples (with consent)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Privacy and Data Protection
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. 
              By using the Service, you agree to our Privacy Policy.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-medium text-blue-800 mb-2">Key Privacy Points</h3>
              <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                <li>We're GDPR and CCPA compliant</li>
                <li>Customer data is automatically anonymized</li>
                <li>You can export or delete your data anytime</li>
                <li>All data is encrypted and securely stored</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Service Availability and Support
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              8.1 Service Availability
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. 
              We may temporarily suspend the Service for maintenance or updates with notice when possible.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              8.2 Customer Support
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We provide customer support through email, chat, and documentation. 
              Support response times vary by subscription plan.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Limitation of Liability
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 leading-relaxed text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AUTOPROOF INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF 
                PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our total liability to you for any claims arising from these Terms or your use of the Service 
              shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Indemnification
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Autoproof Inc., its officers, directors, 
              employees, and agents from any claims, damages, or expenses (including legal fees) arising 
              from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Termination
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              11.1 Termination by You
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may terminate your account at any time through your dashboard settings or by contacting us. 
              Upon termination, your access to the Service will cease immediately.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">
              11.2 Termination by Us
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate your account if you:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Violate these Terms</li>
              <li>Fail to pay subscription fees</li>
              <li>Engage in fraudulent activity</li>
              <li>Abuse our support team or systems</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update these Terms from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Email notification to your registered address</li>
              <li>Notice in your account dashboard</li>
              <li>Updating the "Last updated" date on this page</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              13. Governing Law and Jurisdiction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of the State of Delaware, United States, 
              without regard to its conflict of law provisions. Any disputes shall be resolved 
              in the courts of Delaware or through binding arbitration.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              14. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@autoproof.com</p>
              <p className="text-gray-700 mb-2"><strong>Address:</strong> 123 Business Ave, Suite 100, San Francisco, CA 94105</p>
              <p className="text-gray-700"><strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM EST</p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-blue-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-blue-100 mb-6">
            By using Autoproof, you agree to these Terms of Service and our Privacy Policy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/onboarding"
              className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Have Questions?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};