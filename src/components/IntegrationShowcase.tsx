import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Github, Slack } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface IntegrationStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface IntegrationProps {
  title: string;
  description: string;
  steps: IntegrationStep[];
  icon: React.ReactNode;
  color: string;
}

const Integration: React.FC<IntegrationProps> = ({
  title,
  description,
  steps,
  icon,
  color,
}) => {
  return (
    <Card className="overflow-hidden border-2 bg-white">
      <div className={`p-6 flex items-center gap-4 ${color}`}>
        <div className="bg-white p-2 rounded-full">{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-white/80">{description}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="bg-gray-100 p-2 rounded-full mt-1">
                {step.icon}
              </div>
              <div>
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 flex justify-center">
                  <ArrowRight className="text-gray-300 mt-2" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const IntegrationShowcase: React.FC = () => {
  const slackSteps: IntegrationStep[] = [
    {
      title: "Connect Slack",
      description: "Authorize AutoProof to access your Slack workspace",
      icon: <Slack size={20} />,
    },
    {
      title: "Configure Channels",
      description: "Select which channels to monitor for compliance",
      icon: <Check size={20} />,
    },
    {
      title: "Real-time Monitoring",
      description: "AutoProof analyzes messages for policy violations",
      icon: <Check size={20} />,
    },
  ];

  const githubSteps: IntegrationStep[] = [
    {
      title: "Connect GitHub",
      description: "Authorize AutoProof to access your repositories",
      icon: <Github size={20} />,
    },
    {
      title: "Configure Repos",
      description: "Select which repositories to monitor",
      icon: <Check size={20} />,
    },
    {
      title: "Automated Reviews",
      description: "AutoProof analyzes PRs and code for compliance issues",
      icon: <Check size={20} />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Seamless Integrations
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Connect AutoProof to your existing tools in minutes and start
            detecting compliance issues automatically.
          </motion.p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <Integration
              title="Slack Integration"
              description="Monitor messages for policy violations"
              steps={slackSteps}
              icon={<Slack size={24} className="text-[#4A154B]" />}
              color="bg-[#4A154B]"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Integration
              title="GitHub Integration"
              description="Scan code and PRs for compliance issues"
              steps={githubSteps}
              icon={<Github size={24} className="text-[#24292e]" />}
              color="bg-[#24292e]"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-600 mb-6">
            More integrations coming soon, including Microsoft Teams, GitLab,
            and Bitbucket.
          </p>
          <a
            href="#"
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            Request an integration
            <ArrowRight size={16} className="ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationShowcase;
