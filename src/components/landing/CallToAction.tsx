"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CallToAction() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/10 -skew-y-3 transform origin-bottom-right" />
      <div className="container px-4 relative z-10">
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl overflow-hidden relative">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Siap Mentransformasi Sistem Absensi Sekolah Anda?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl">
              Bergabunglah dengan ratusan sekolah modern lainnya yang telah beralih ke ATTENDLY.
              Lebih efisien, lebih akurat, dan lebih transparan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto px-8 py-6 text-lg rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
