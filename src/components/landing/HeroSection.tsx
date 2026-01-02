"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  settings: any;
}

export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20">
      {/* Content Container - Centered & Minimal */}
      <div className="container px-4 text-center z-10">

        {/* Badge / Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 mb-8 backdrop-blur-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-medium text-blue-400 tracking-wide uppercase">
            System Live
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          {settings.heroTitle || "Digital Presence System"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground/80 font-light max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {settings.heroSubtitle || "A futuristic approach to school management. Efficient, transparent, and built for the modern era."}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(59,130,246,0.3)]"
          >
            <span className="mr-2">Mulai Sekarang</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
          </Link>

          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 backdrop-blur-sm"
          >
            Pelajari Sistem
          </a>
        </motion.div>
      </div>

      {/* Decorative localized glow behind text (Enhances readability) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
    </section>
  );
}
