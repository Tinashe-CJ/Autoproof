import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Landing Pages
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { DemoPage } from './pages/DemoPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { FAQPage } from './pages/FAQPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiePage } from './pages/CookiePage';

// Dashboard Pages
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { WidgetsPage } from './pages/dashboard/WidgetsPage';
import { ReviewsPage } from './pages/dashboard/ReviewsPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { EmailsPage } from './pages/dashboard/EmailsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { OnboardingPage } from './pages/dashboard/OnboardingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Landing Site Routes */}
          <Route path="/" element={
            <div>
              <Header />
              <HomePage />
              <Footer />
            </div>
          } />
          <Route path="/pricing" element={
            <div>
              <Header />
              <PricingPage />
              <Footer />
            </div>
          } />
          <Route path="/features" element={
            <div>
              <Header />
              <FeaturesPage />
              <Footer />
            </div>
          } />
          <Route path="/demo" element={
            <div>
              <Header />
              <DemoPage />
              <Footer />
            </div>
          } />
          <Route path="/testimonials" element={
            <div>
              <Header />
              <TestimonialsPage />
              <Footer />
            </div>
          } />
          <Route path="/faq" element={
            <div>
              <Header />
              <FAQPage />
              <Footer />
            </div>
          } />
          <Route path="/about" element={
            <div>
              <Header />
              <AboutPage />
              <Footer />
            </div>
          } />
          <Route path="/contact" element={
            <div>
              <Header />
              <ContactPage />
              <Footer />
            </div>
          } />
          <Route path="/privacy" element={
            <div>
              <Header />
              <PrivacyPage />
              <Footer />
            </div>
          } />
          <Route path="/terms" element={
            <div>
              <Header />
              <TermsPage />
              <Footer />
            </div>
          } />
          <Route path="/cookie-policy" element={
            <div>
              <Header />
              <CookiePage />
              <Footer />
            </div>
          } />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="widgets" element={<WidgetsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="emails" element={<EmailsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;