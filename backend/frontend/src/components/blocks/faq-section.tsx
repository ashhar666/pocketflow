"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is my financial data safe with Expense Tracker?",
    answer: "Absolutely. We use bank-grade AES-256 encryption to protect your data both at rest and in transit. Your security is our highest priority, and we never have access to your raw password or unencrypted financial details.",
  },
  {
    question: "Who can see my expense data?",
    answer: "Only you. Your data is private and tied to your account. We do not sell, share, or rent your personal or financial information to third parties. Our team can only access aggregated, anonymized data for system performance monitoring.",
  },
  {
    question: "Can I export my data for tax purposes?",
    answer: "Yes! You can export all your transactions, budgets, and savings data in CSV or Excel formats at any time. This makes it incredibly easy to share with your accountant or import into tax preparation software.",
  },
  {
    question: "Is there a mobile app available?",
    answer: "Expense Tracker is built as a Progressive Web App (PWA), meaning it works perfectly on all mobile browsers and can be 'installed' on your home screen for a native app experience on both iOS and Android.",
  },
  {
    question: "Do you support multiple currencies?",
    answer: "Yes, we support over 150+ currencies. You can set a primary currency for your dashboard and track individual expenses in different currencies, with automatic conversion based on real-time exchange rates.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="pt-16 pb-32 bg-[#030303]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tighter uppercase italic">
            Common Questions
          </h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">
            Everything you need to know about building your wealth with Expense Tracker.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ filter: 'blur(12px)', opacity: 0 }}
              whileInView={{ filter: 'blur(0px)', opacity: 1 }}
              className={`border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 ${
                openIndex === index ? "bg-white/[0.03] border-white/10" : "bg-transparent hover:bg-white/[0.01]"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className="text-xl font-black text-zinc-400 group-hover:text-white transition-colors uppercase tracking-tight italic">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`size-5 text-muted-foreground transition-transform duration-300 ${
                    openIndex === index ? "rotate-180 text-foreground" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-10 pb-10 text-zinc-500 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 p-12 bg-white/[0.02] rounded-[3rem] border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6">Unanswered Queries?</p>
            <a 
                href="mailto:support@expensetracker.com"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-sm font-black text-black shadow-2xl shadow-white/5 hover:bg-zinc-200 transition-all uppercase tracking-[0.2em]"
            >
                Contact Command
            </a>
        </div>
      </div>
    </section>
  );
};
