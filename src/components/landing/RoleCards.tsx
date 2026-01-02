"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import * as LucideIcons from "lucide-react";

const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name];
  return Icon || Check;
};

interface RoleCardsProps {
  roles: any[];
}

export function RoleCards({ roles }: RoleCardsProps) {
  if (!roles || roles.length === 0) return null;

  return (
    <section className="py-24 relative z-10">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Solusi Untuk Semua</h2>
          <p className="text-muted-foreground">Platform yang mengakomodasi kebutuhan seluruh warga sekolah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => {
            const Icon = getIcon(role.icon);
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/50 backdrop-blur-sm border border-white/10 p-6 rounded-3xl hover:bg-card hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{role.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">{role.description}</p>

                <ul className="space-y-3">
                  {role.benefits && role.benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
