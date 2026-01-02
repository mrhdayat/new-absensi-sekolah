"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { CheckCircle, Shield, GraduationCap, Users } from "lucide-react";

// Helper to safely get icon by name
const getIcon = (name: string) => {
  // @ts-ignore
  const Icon = (LucideIcons as any)[name];
  return Icon || Users;
};

interface RoleCardsProps {
  roles: any[]; // From Prisma LandingRole model
}

export function RoleCards({ roles }: RoleCardsProps) {
  if (!roles || roles.length === 0) return null;

  return (
    <section className="py-32 relative z-10 border-t border-white/5">
      <div className="container px-4 mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6"
          >
            Ekosistem Pendidikan
          </motion.h2>
          <div className="h-1 w-20 bg-blue-500 rounded-full" />
        </div>

        {/* Vertical Stack */}
        <div className="flex flex-col gap-8 md:gap-12 max-w-5xl mx-auto">
          {roles.map((role, index) => {
            const Icon = getIcon(role.icon);
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative grid md:grid-cols-12 gap-6 md:gap-10 p-8 md:p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500"
              >
                {/* Icon / Visual Identifier */}
                <div className="md:col-span-2 flex flex-col items-center md:items-start justify-start">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-4 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest opacity-50">
                    Role 0{index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="md:col-span-10">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Benefits Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {role.benefits && role.benefits.map((benefit: string, bIndex: number) => (
                      <div key={bIndex} className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-sm text-muted-foreground/80">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
