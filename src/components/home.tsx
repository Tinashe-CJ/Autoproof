import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Shield, Code, Lock, Clock, Zap, Check, Search, AlertTriangle, BarChart3, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FeaturesGrid from "./FeaturesGrid";
import IntegrationShowcase from "./IntegrationShowcase";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AutoProof</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors">
                Integrations
              </a>
              <a href="/info" className="text-gray-600 hover:text-gray-900 transition-colors">
                Learn More
              </a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = '/sign-in'}>
                Sign In
              </Button>
              <Button onClick={() => window.location.href = '/sign-up'}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-32 overflow-hidden mt-16">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/30 to-slate-900/0" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left side - Text content */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
                  AI-Powered
                </span>{" "}
                Compliance Automation
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Stop struggling with manual compliance processes. AutoProof uses AI to automatically detect, 
                prevent, and manage compliance violations across your entire development workflow. 
                Reduce audit preparation time by 80% and catch violations before they become breaches.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => window.location.href = '/sign-up'}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-8 py-6 h-auto"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/info'}
                  className="border-slate-400 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 h-auto bg-transparent"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Learn More
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/pricing'}
                  className="border-slate-400 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 h-auto bg-transparent"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  View Pricing
                </Button>
              </div>
            </motion.div>

            {/* Right side - Dashboard mockup */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg blur-sm opacity-75"></div>
                <div className="relative bg-slate-900 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-sm text-slate-400">
                      AutoProof Dashboard
                    </div>
                  </div>
                  <div className="p-4">
                    <img
                      src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80"
                      alt="AutoProof Dashboard"
                      className="rounded-md w-full h-auto shadow-lg"
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                        <div className="text-xs text-slate-400">
                          Compliance Score
                        </div>
                        <div className="text-xl font-bold text-green-400">
                          94%
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
                          <div
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: "94%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-slate-800 p-3 rounded-md border border-slate-700">
                        <div className="text-xs text-slate-400">
                          Issues Detected
                        </div>
                        <div className="text-xl font-bold text-amber-400">3</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            Critical: 0
                          </span>
                          <span className="text-xs text-slate-400">
                            Warning: 3
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <FeaturesGrid />
      </section>

      {/* Integrations Section */}
      <section id="integrations">
        <IntegrationShowcase />
      </section>

      {/* Key Functionality Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AutoProof provides comprehensive compliance automation tools designed specifically for engineering teams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Analysis Playground</h3>
                  <p className="text-gray-600 mb-4">
                    Test compliance analysis with your content in real-time. Upload documents, paste text, 
                    or connect your integrations to see how AutoProof detects violations.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/info#analysis-playground'}
                    className="w-full"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Policy Management</h3>
                  <p className="text-gray-600 mb-4">
                    Create and customize compliance rules specific to your industry, regulations, 
                    and internal policies. Support for SOC 2, GDPR, HIPAA, and PCI DSS.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/info#policy-management'}
                    className="w-full"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Violations Feed</h3>
                  <p className="text-gray-600 mb-4">
                    Monitor and manage compliance violations in real-time. Get instant alerts, 
                    track resolution progress, and maintain audit trails automatically.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/info#violations-feed'}
                    className="w-full"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">API Integration</h3>
                  <p className="text-gray-600 mb-4">
                    Integrate AutoProof into your existing workflow with our comprehensive API. 
                    Custom integrations, webhooks, and SDKs for all major platforms.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/info#api-integration'}
                    className="w-full"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Reporting</h3>
                  <p className="text-gray-600 mb-4">
                    Comprehensive compliance analytics, trend analysis, and automated reporting. 
                    Generate audit-ready reports for stakeholders and regulators.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/info#analytics'}
                    className="w-full"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Collaboration</h3>
                  <p className="text-gray-600 mb-4">
                    Built for engineering teams with role-based access, shared dashboards, 
                    and collaborative violation resolution workflows.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/info#team-collaboration'}
                    className="w-full"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              onClick={() => window.location.href = '/info'}
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-8 py-6 h-auto"
            >
              <Shield className="mr-2 h-5 w-5" />
              Explore All Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Automate Your Compliance?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of teams already using AutoProof to maintain compliance
              without slowing down development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.location.href = '/sign-up'}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 h-auto font-medium"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/pricing'}
                className="border-white/80 text-white hover:bg-white hover:text-blue-600 px-8 py-6 h-auto bg-white/10"
              >
                View Pricing Plans
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold">AutoProof</span>
              </div>
              <p className="text-gray-400">
                AI-powered compliance automation for modern development teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="/info" className="hover:text-white transition-colors">Learn More</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/info" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AutoProof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;