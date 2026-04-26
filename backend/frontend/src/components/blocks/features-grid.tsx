"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const features = [
  {
    title: "Telegram Bot Integration",
    description: "Your personal financial assistant on the go. Log expenses instantly via chat without opening a complex app.",
    label: "BOT",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Instant Expense Logging",
    description: "Speed-focused architecture. Record your spending in milliseconds with natural language or receipt snapshots.",
    label: "LOG",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Smart Categorization",
    description: "Automated precision. Our AI identifies and sorts your transactions into meaningful categories instantly.",
    label: "CAT",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  },
  {
    title: "Monthly Reports & Analytics",
    description: "Absolute financial clarity. Deep-dive into your spending patterns with beautiful, interactive visualizations.",
    label: "REP",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Multi-currency Support",
    description: "Built for global mobility. Effortlessly track movement of capital across any currency with real-time conversion.",
    label: "GBL",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }
]

export function FeaturesGrid() {
  return (
    <section className="bg-[#030303] py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic border border-emerald-500/20 px-1 rounded-sm">CORE.STACK</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-8"
          >
            Engineered for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Financial Mastery</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-zinc-500 text-sm uppercase tracking-[0.2em] font-medium leading-relaxed"
          >
            A suite of high-performance instruments designed to transform raw transaction data into actionable financial intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-card p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500 border border-white/5", feature.bg)}>
                <span className={cn("text-xs font-black italic tracking-tighter", feature.color)}>{feature.label}</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase italic mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ambient Depth */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  )
}
