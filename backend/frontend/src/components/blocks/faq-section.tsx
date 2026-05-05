"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I log expenses with the Telegram bot?",
    answer: "Connect your account to @PaisaTrackerBot and send a text or receipt photo for instant AI parsing and dashboard syncing.",
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes, PocketFlow uses bank-grade AES-256 encryption and a zero-trust architecture to ensure only you can access your data.",
  },
  {
    question: "How does the multi-currency conversion work?",
    answer: "Our system supports over 150 currencies, automatically converting international spending to your primary currency using real-time exchange rates.",
  },
  {
    question: "Can I export my data for accounting?",
    answer: "Yes, you can export all transaction data as a CSV or Excel file for use with external accounting tools or tax preparation.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="faq" className="py-16 bg-background relative overflow-hidden border-t border-border/10 transition-colors duration-400">
      {/* Decorative Aurora Blob */}
      <div className="aurora-bg !opacity-5 dark:!opacity-10">
        <div className="aurora-blob w-[600px] h-[600px] bg-emerald-600/5 right-0 top-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-8"
          >
            Common <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-zinc-500">questions</span>
          </motion.h2>
          <motion.p 
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 font-medium max-w-xl mx-auto text-sm uppercase tracking-[0.2em] leading-relaxed"
          >
            Everything you need to know about how to use the app and keep your money safe.
          </motion.p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={shouldReduceMotion ? { opacity: 1 } : { filter: 'blur(12px)', opacity: 0 }}
              whileInView={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card overflow-hidden transition-all duration-700 bg-white/[0.02] border border-white/5 ${
                openIndex === index ? "bg-emerald-500/[0.03] border-emerald-500/20" : "hover:bg-white/[0.05]"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-10 py-8 flex items-center justify-between text-left group"
              >
                <span className={cn(
                  "text-xl font-bold tracking-tight transition-colors duration-500",
                  openIndex === index ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300"
                )}>
                  {faq.question}
                </span>
                <span className={cn(
                  "text-[10px] font-black italic transition-transform duration-500 text-zinc-600",
                  openIndex === index ? "rotate-90 text-emerald-500" : ""
                )}>
                  {openIndex === index ? "[-]" : "[+]"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-10 pb-10 text-zinc-400 leading-relaxed font-medium text-base max-w-3xl">
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
};
