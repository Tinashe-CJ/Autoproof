import React from "react";
import { Check, Shield, Zap, Clock, Code, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = (
  { icon, title, description }: FeatureProps = {
    icon: <Check className="h-6 w-6" />,
    title: "Feature",
    description: "Feature description goes here.",
  },
) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

interface FeaturesGridProps {
  title?: string;
  subtitle?: string;
  features?: FeatureProps[];
}

const FeaturesGrid = ({
  title = "Powerful Features for Compliance Automation",
  subtitle = "AutoProof helps engineering teams maintain compliance without slowing down development.",
  features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "AI-Powered Detection",
      description:
        "Advanced machine learning algorithms automatically identify potential compliance violations in real-time.",
    },
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      title: "Seamless Integrations",
      description:
        "Connect with Slack and GitHub to monitor communications and code changes for policy violations.",
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "Compliance Standards",
      description:
        "Built-in support for SOC 2, ISO 27001, HIPAA, GDPR, and other major compliance frameworks.",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Time-Saving Automation",
      description:
        "Reduce manual compliance reviews by up to 80% with automated scanning and reporting.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Real-Time Alerts",
      description:
        "Get instant notifications when potential compliance issues are detected in your systems.",
    },
    {
      icon: <Check className="h-6 w-6 text-primary" />,
      title: "Audit-Ready Reports",
      description:
        "Generate comprehensive compliance reports with a single click for auditors and stakeholders.",
    },
  ],
}: FeaturesGridProps) => {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
