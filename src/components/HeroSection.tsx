import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";

interface HeroSectionProps {
  onStartFree?: () => void;
  onBookDemo?: () => void;
}

const HeroSection = ({
  onStartFree = () => {},
  onBookDemo = () => {},
}: HeroSectionProps) => {
  return (
    <section className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-32 overflow-hidden">
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
              Automatically detect policy violations across Slack and GitHub.
              Save time and reduce compliance gaps with AutoProof's intelligent
              monitoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={onStartFree}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium px-8 py-6 h-auto"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={onBookDemo}
                className="border-slate-500 text-white hover:bg-slate-800 px-8 py-6 h-auto"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Book a Demo
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
  );
};

export default HeroSection;
