"use client"

import React from 'react'
import { motion } from 'framer-motion'

const steps = [
  {
    title: "Deploy",
    description: "Initialize your encrypted link to @PaisaTrackerBot on Telegram in seconds.",
    icon: "LNK",
    number: "01"
  },
  {
    title: "Capture",
    description: "Snap a receipt or message the bot as you spend. Our AI identifies capital flow instantly.",
    icon: "CAP",
    number: "02"
  },
  {
    title: "Master",
    description: "Access your global unified console. Master your wealth with proprietary intelligence.",
    icon: "MST",
    number: "03"
  }
]

export function HowItWorksSimple() {
  return (
    <section className="bg-background py-16 px-6 relative overflow-hidden border-t border-border/10 transition-colors duration-400">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic mb-6"
            >
              The Path to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-zinc-500">Wealth Clarity</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 text-lg font-medium leading-relaxed"
            >
              We’ve removed the friction from financial management. A systematic 3-step process to transform how you track capital.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden lg:flex items-center gap-2 text-zinc-600 font-bold uppercase tracking-[0.2em] italic text-[10px]"
          >
            <span>Seamless Integration</span>
            <div className="w-12 h-[1px] bg-zinc-800" />
            <span>Real-time Sync</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="size-28 rounded-full bg-foreground/5 border border-border/10 flex items-center justify-center mb-8 relative group transition-all duration-500 hover:border-border/20">
                <div className="absolute -top-4 -right-4 size-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-[10px] font-black italic text-zinc-500 group-hover:text-foreground transition-colors">
                  {step.number}
                </div>
                <span className="text-xl font-black text-foreground transition-transform duration-500 group-hover:scale-110 italic">{step.icon}</span>
              </div>
              
              <h3 className="text-2xl font-black text-foreground uppercase italic mb-4 tracking-tight">
                {step.title}
              </h3>
              <p className="text-zinc-500 font-medium leading-relaxed max-w-[280px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
