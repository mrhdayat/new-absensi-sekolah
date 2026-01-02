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
    <section id="features" className="py-32 relative z-10 bg-background/50 backdrop-blur-sm">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400"
          >
            Fitur Unggulan
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Teknologi absensi modern yang dirancang untuk efisiensi dan akurasi tinggi sekolah Anda.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative p-1 rounded-3xl bg-gradient-to-b from-border to-transparent hover:from-blue-500/50 transition-all duration-300"
              >
                <div className="relative h-full bg-card/50 backdrop-blur-xl p-6 md:p-8 rounded-[22px] border border-white/5 shadow-xl overflow-hidden flex flex-col items-start text-left">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />

                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>

                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
