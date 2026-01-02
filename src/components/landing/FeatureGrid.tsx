"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { CheckCircle } from "lucide-react";

// Helper to safely get icon by name
const getIcon = (name: string) => {
  // @ts-ignore
  const Icon = (LucideIcons as any)[name];
  return Icon || CheckCircle;
};

interface FeatureGridProps {
  features: any[]; // From Prisma LandingFeature model
}

export function FeatureGrid({ features }: FeatureGridProps) {
  // Fallback if no features
  if (!features || features.length === 0) return null;

  return (
    <section id="features" className="py-32 relative z-10">
      <div className="container px-4 mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight text-white"
          >
            Kapabilitas Sistem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground/80 font-light"
          >
            Teknologi yang dirancang untuk kecepatan, akurasi, dan transparansi data sekolah.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 backdrop-blur-sm"
              >
                {/* Visual Glow on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Icon */}
                <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:rotate-6">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-medium mb-3 text-white group-hover:translate-x-1 transition-transform duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-muted-foreground/80 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
