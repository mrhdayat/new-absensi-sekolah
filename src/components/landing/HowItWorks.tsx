"use client";

import { motion } from "framer-motion";
import { UserPlus, CalendarCheck, CheckCircle, FileBarChart, ShieldCheck } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Dynamic Icon Helper
const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name];
  return Icon || CheckCircle;
};

interface HowItWorksProps {
  steps: any[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="py-24 relative z-10 bg-background/50">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerja Sistem</h2>
          <p className="text-muted-foreground">Alur sederhana untuk kemudahan penggunaan</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = getIcon(step.icon);
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border/50 p-6 rounded-2xl text-center shadow-lg relative group hover:border-blue-500/30 transition-colors"
                >
                  <div className="h-16 w-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
