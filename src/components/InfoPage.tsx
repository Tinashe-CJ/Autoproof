import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Zap, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Star,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  MessageSquare,
  GitBranch,
  Eye,
  Lock,
  Globe,
  Award,
  Lightbulb,
  Rocket,
  ArrowRight,
  Play,
  Settings,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Code,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Server,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from './Footer';

const InfoPage = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "AI-Powered Detection",
      description: "Advanced GPT-4 analysis that understands context and detects subtle compliance violations that traditional rule-based systems miss."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Monitoring",
      description: "Instant alerts and notifications across Slack, GitHub, and custom integrations. Never miss a compliance issue again."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Built for engineering teams with role-based access, shared dashboards, and collaborative violation resolution workflows."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Analytics & Reporting",
      description: "Comprehensive compliance analytics, trend analysis, and automated reporting for audits and stakeholder updates."
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Custom Policy Engine",
      description: "Create and customize compliance rules specific to your industry, regulations, and internal policies."
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "SOC 2 compliant, end-to-end encryption, and enterprise-grade security with SSO integration."
    }
  ];

  const useCases = [
    {
      title: "SOC 2 Compliance",
      description: "Automatically monitor and enforce SOC 2 controls across your development workflow",
      icon: <Shield className="h-5 w-5" />,
      benefits: ["Real-time control monitoring", "Automated evidence collection", "Audit-ready reporting"]
    },
    {
      title: "GDPR Data Protection",
      description: "Detect and prevent PII exposure in code, messages, and documentation",
      icon: <Lock className="h-5 w-5" />,
      benefits: ["PII detection in real-time", "Data classification", "Breach prevention"]
    },
    {
      title: "HIPAA Compliance",
      description: "Ensure PHI protection across all development activities and communications",
      icon: <FileText className="h-5 w-5" />,
      benefits: ["PHI identification", "Secure development practices", "Compliance tracking"]
    },
    {
      title: "PCI DSS Security",
      description: "Monitor for credit card data exposure and enforce security standards",
      icon: <CreditCard className="h-5 w-5" />,
      benefits: ["Card data detection", "Security standard enforcement", "Risk assessment"]
    }
  ];

  const comparisons = [
    {
      competitor: "Traditional Compliance Tools",
      autoProof: "AI-Powered Intelligence",
      traditional: "Rule-based detection",
      advantage: "AutoProof uses GPT-4 to understand context and detect subtle violations that rule-based systems miss"
    },
    {
      competitor: "Manual Code Reviews",
      autoProof: "Automated Scanning",
      traditional: "Human review required",
      advantage: "AutoProof scans every commit, PR, and message automatically, catching issues before they reach production"
    },
    {
      competitor: "Generic Security Tools",
      autoProof: "Compliance-Focused",
      traditional: "General security monitoring",
      advantage: "AutoProof is specifically designed for compliance frameworks like SOC 2, GDPR, HIPAA, and PCI DSS"
    },
    {
      competitor: "Point Solutions",
      autoProof: "Integrated Platform",
      traditional: "Multiple disconnected tools",
      advantage: "AutoProof provides end-to-end compliance monitoring across Slack, GitHub, and custom integrations"
    }
  ];

  const testimonials = [
    {
      quote: "AutoProof has transformed our compliance process. We've reduced audit preparation time by 80% and caught violations before they became issues.",
      author: "Sarah Chen",
      role: "CTO",
      company: "TechFlow Inc."
    },
    {
      quote: "The AI-powered detection is incredible. It found compliance issues we didn't even know existed in our codebase.",
      author: "Michael Rodriguez",
      role: "Security Lead",
      company: "SecureBank"
    },
    {
      quote: "Finally, a compliance tool that doesn't slow down our development team. AutoProof works seamlessly with our existing workflow.",
      author: "Jennifer Park",
      role: "Engineering Manager",
      company: "CloudScale"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/50 to-slate-900/20" />

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <Link to="/">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </Link>
                <Link to="/">
                  <span className="font-bold text-2xl text-white">AutoProof</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 mb-6">
              <Award className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-blue-300 text-sm font-medium">AI-Powered Compliance Automation</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">AutoProof</span> is the Future of Compliance
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Stop struggling with manual compliance processes. AutoProof uses AI to automatically detect, 
              prevent, and manage compliance violations across your entire development workflow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-8 py-6 h-auto"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Get Started Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-white/40 text-white hover:bg-white/20 hover:border-white/60 px-8 py-6 h-auto bg-white/5"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is AutoProof */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What is AutoProof?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              AutoProof is an AI-powered compliance automation platform that helps engineering teams 
              maintain compliance without slowing down development. Think of it as your automated 
              compliance officer that never sleeps.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose AutoProof */}
      <section className="relative z-10 py-16 bg-white/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose AutoProof?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Traditional compliance tools are reactive, manual, and slow. AutoProof is proactive, 
              automated, and fast. Here's why leading companies choose us:
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">80% Faster Compliance</h3>
                  <p className="text-slate-300">Automated detection and resolution reduces compliance overhead by 80% compared to manual processes.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Zero False Positives</h3>
                  <p className="text-slate-300">AI-powered context understanding eliminates false positives that plague traditional rule-based systems.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Real-time Protection</h3>
                  <p className="text-slate-300">Monitor Slack, GitHub, and custom integrations in real-time. Catch violations before they become breaches.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Developer-Friendly</h3>
                  <p className="text-slate-300">Built for engineering teams. Integrates seamlessly with existing tools without disrupting workflow.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Audit-Ready Reports</h3>
                  <p className="text-slate-300">Automatically generate compliance reports and evidence for SOC 2, GDPR, HIPAA, and PCI DSS audits.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
                  <p className="text-slate-300">SOC 2 compliant with end-to-end encryption, SSO integration, and enterprise-grade security controls.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Compliance Use Cases
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              AutoProof supports all major compliance frameworks and can be customized for your specific needs.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                      {useCase.icon}
                    </div>
                    <CardTitle className="text-white text-xl">{useCase.title}</CardTitle>
                  </div>
                  <CardDescription className="text-slate-300 text-base">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center space-x-2 text-slate-300">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative z-10 py-16 bg-white/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AutoProof vs. Traditional Solutions
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See how AutoProof's AI-powered approach outperforms traditional compliance tools.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {comparisons.map((comparison, index) => (
              <Card key={index} className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-slate-400 mb-2">{comparison.competitor}</h3>
                      <p className="text-slate-300">{comparison.traditional}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">AutoProof</h3>
                      <p className="text-white font-medium">{comparison.autoProof}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Advantage</h3>
                      <p className="text-slate-300 text-sm">{comparison.advantage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Join hundreds of companies that trust AutoProof for their compliance needs.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-slate-300 mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{testimonial.author}</p>
                      <p className="text-slate-400 text-sm">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-blue-600/90 to-violet-600/90 border border-blue-400/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  Ready to Transform Your Compliance?
                </h2>
                <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-md">
                  Join the future of compliance automation. Start your free trial today and see 
                  how AutoProof can revolutionize your compliance process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-8 py-6 h-auto"
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    Start Free Trial
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="border-white/40 text-white hover:bg-white/20 hover:border-white/60 px-8 py-6 h-auto bg-white/5"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Schedule Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InfoPage; 