"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQSectionProps {
  faqs: any[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faq" className="py-32 relative z-10">
      <div className="container px-4 mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-white mb-4">Pertanyaan Umum</h2>
          <p className="text-muted-foreground">Jawaban untuk hal yang sering ditanyakan tentang ATTENDLY.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-white/5 rounded-xl bg-[#0F1218] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className={`font-medium ${openIndex === index ? 'text-blue-400' : 'text-white'}`}>
                  {faq.question}
                </span>
                <span className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <Minus className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-sm border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
