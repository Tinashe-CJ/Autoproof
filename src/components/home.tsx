import React from "react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import FeaturesGrid from "./FeaturesGrid";
import PricingTiers from "./PricingTiers";
import IntegrationShowcase from "./IntegrationShowcase";
import { Button } from "./ui/button";
import { Github, Slack } from "lucide-react";

const Home = () => {
  // Animation variants for scroll animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="font-bold text-xl">AutoProof</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <a
              href="#integrations"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Integrations
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Testimonials
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              Log in
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content with 80px top padding to account for fixed header */}
      <main className="pt-20">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Grid */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">
                AI-Powered Compliance Automation
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                AutoProof continuously monitors your communications and code to
                detect policy violations before they become problems.
              </p>
            </motion.div>
            <FeaturesGrid />
          </div>
        </section>

        {/* Pricing Tiers */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">
                Simple, Usage-Based Pricing
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your team's needs with transparent,
                predictable pricing.
              </p>
            </motion.div>
            <PricingTiers />
          </div>
        </section>

        {/* Integration Showcase */}
        <section id="integrations" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect AutoProof to your existing workflow in minutes with our
                native integrations.
              </p>
            </motion.div>
            <IntegrationShowcase />
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">
                Trusted by Engineering Teams
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how AutoProof helps teams maintain compliance without
                slowing down development.
              </p>
            </motion.div>

            {/* Placeholder for future testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg p-6 shadow-sm border border-border"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
                    <div>
                      <h4 className="font-medium">Coming Soon</h4>
                      <p className="text-sm text-muted-foreground">
                        Future Customer
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "AutoProof has helped us maintain compliance without slowing
                    down our development process."
                  </p>
                </div>
              ))}
            </div>

            {/* Company logos placeholder */}
            <div className="mt-16">
              <p className="text-center text-sm text-muted-foreground mb-8">
                TRUSTED BY INNOVATIVE COMPANIES
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-24 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">
                Ready to automate compliance?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Start detecting policy violations across your communication
                channels today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="px-8">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Book a Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">
                    A
                  </span>
                </div>
                <span className="font-bold">AutoProof</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered compliance automation for engineering teams.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Github size={18} />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Slack size={18} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#integrations"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AutoProof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
