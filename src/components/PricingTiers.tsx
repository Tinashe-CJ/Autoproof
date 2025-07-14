import React from "react";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: string;
  billingPeriod: string;
  features: PricingFeature[];
  cta: string;
  popular?: boolean;
}

const PricingTiers = () => {
  const tiers: PricingTier[] = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started with compliance",
      price: "$49",
      billingPeriod: "per month",
      features: [
        { name: "Up to 5 team members", included: true },
        { name: "Slack integration", included: true },
        { name: "GitHub integration", included: true },
        { name: "100 AI scans per month", included: true },
        { name: "Basic compliance reports", included: true },
        { name: "Email support", included: true },
        { name: "Custom policies", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Growth",
      description: "For growing teams with increasing compliance needs",
      price: "$149",
      billingPeriod: "per month",
      features: [
        { name: "Up to 20 team members", included: true },
        { name: "Slack integration", included: true },
        { name: "GitHub integration", included: true },
        { name: "500 AI scans per month", included: true },
        { name: "Advanced compliance reports", included: true },
        { name: "Email support", included: true },
        { name: "Custom policies", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Business",
      description: "For organizations with complex compliance requirements",
      price: "$349",
      billingPeriod: "per month",
      features: [
        { name: "Unlimited team members", included: true },
        { name: "Slack integration", included: true },
        { name: "GitHub integration", included: true },
        { name: "Unlimited AI scans", included: true },
        { name: "Custom compliance reports", included: true },
        { name: "Email support", included: true },
        { name: "Custom policies", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section className="w-full py-16 bg-background" id="pricing">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Simple, Usage-Based Pricing
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Choose the plan that fits your team's compliance needs. All plans
            include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <Card
              key={index}
              className={`flex flex-col h-full border ${tier.popular ? "border-primary shadow-lg relative" : "border-border"}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="mt-2">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">
                    {tier.billingPeriod}
                  </span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-muted mr-2 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included ? "" : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Need a custom plan?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingTiers;
