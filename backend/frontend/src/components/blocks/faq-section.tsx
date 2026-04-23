"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I log expenses with the Telegram bot?",
    answer: "Getting started is simple. Just link your account to @PaisaTrackerBot. From there, you can send a text message (e.g., 'Lunch 150') or even a photo of your receipt. The bot instantly syncs with your dashboard.",
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We employ bank-grade AES-256 encryption. Your security is our highest priority, utilizing a secure architecture that ensures only you have access to your personal financial intelligence.",
  },
  {
    question: "How does the multi-currency conversion work?",
    answer: "We support over 150 global currencies. When you log an expense in a foreign currency, the system automatically fetches the real-time exchange rate and converts it to your primary base currency for accurate tracking.",
  },
  {
    question: "Can I export my data for accounting?",
    answer: "Yes. You can export all your transactions and analytics in CSV or Excel formats at any time. This allows for seamless integration with professional tax preparation software or personal accounting workflows.",
  },
  {
    question: "Is there a monthly subscription fee?",
    answer: "We offer a flexible range of options, from a powerful free tier to professional accounts for high-velocity wealth management. Check our console for the latest plan details.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="py-16 bg-background relative overflow-hidden border-t border-border/10 transition-colors duration-400">
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
            className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic mb-8"
          >
            Essential <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-zinc-500">Q&A</span>
          </motion.h2>
          <motion.p 
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 font-medium max-w-xl mx-auto text-sm uppercase tracking-[0.2em] leading-relaxed"
          >
            Everything you need to know about the system architecture and financial management protocols.
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
                  "text-xl font-black uppercase tracking-tight italic transition-colors duration-500",
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
                    <div className="px-10 pb-10 text-zinc-400 leading-relaxed font-semibold text-base max-w-3xl uppercase tracking-widest">
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
