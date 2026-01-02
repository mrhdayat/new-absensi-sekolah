"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  settings: {
    heroTitle: string;
    heroSubtitle: string;
    [key: string]: any;
  };
}

export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative z-10 min-h-[100svh] md:min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0">
      <div className="container px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="text-foreground">Smart Attendance System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
        >
          {settings.heroTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {settings.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="px-8 py-6 text-lg rounded-2xl shadow-blue-500/20 shadow-xl transition-transform hover:scale-105"
            >
              Mulai Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg rounded-2xl border-primary/20 bg-background/50 backdrop-blur hover:bg-background/80"
            >
              Pelajari Lebih Lanjut
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
