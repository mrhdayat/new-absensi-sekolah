"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { ArrowRight, CheckCircle } from "lucide-react";

// Helper to safely get icon by name
const getIcon = (name: string) => {
  // @ts-ignore
  const Icon = (LucideIcons as any)[name];
  return Icon || CheckCircle;
};

interface HowItWorksProps {
  steps: any[]; // From Prisma LandingHowItWorks model
}

export function HowItWorks({ steps }: HowItWorksProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section id="how-it-works" className="py-32 relative z-10 overflow-hidden">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-24 md:flex items-end justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
              Workflow Sistem
            </h2>
            <p className="text-lg text-muted-foreground font-light">
              Proses absensi yang disederhanakan untuk efisiensi maksimal.
            </p>
          </div>
          <div className="hidden md:block">
            {/* Decorative Element */}
            <ArrowRight className="h-8 w-8 text-blue-500/50 -rotate-45" />
          </div>
        </div>

        {/* Horizontal Flow */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 w-full" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {steps.map((step, index) => {
              const Icon = getIcon(step.icon);
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative group"
                >
                  {/* Step Validator Node */}
                  <div className="h-20 w-20 rounded-2xl bg-[#0B0E14] border border-white/10 flex items-center justify-center relative z-10 mb-8 mx-auto md:mx-0 group-hover:border-blue-500/50 transition-colors duration-500">
                    <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className="h-8 w-8 text-blue-500" />

                    {/* Number Badge */}
                    <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[#0B0E14] border border-white/10 flex items-center justify-center text-xs font-mono text-muted-foreground shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-xl font-medium text-white mb-3 text-center md:text-left">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center md:text-left">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
