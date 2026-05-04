"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  MessageSquarePlus, 
  ScanLine, 
  LineChart 
} from 'lucide-react'

const steps = [
  {
    title: "Connect",
    description: "Link your account to our Telegram bot in seconds. No complex setup or forms.",
    icon: MessageSquarePlus,
    number: "01",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Snap & Sync",
    description: "Take a photo of a receipt or text the bot. Our AI extracts everything instantly.",
    icon: ScanLine,
    number: "02",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Track & Save",
    description: "View automated reports and insights on your dashboard. Start saving effortlessly.",
    icon: LineChart,
    number: "03",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  }
]

export function HowItWorksSimple() {
  return (
    <section id="process" className="bg-black py-24 px-6 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6"
          >
            How it <span className="text-zinc-500 font-normal italic">works</span>
          </motion.h2>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto">
            Tracking money is now as easy as sending a message. Follow these 3 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Subtle Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[48px] left-[10%] right-[10%] h-[1px] bg-white/5 z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className={cn(
                "size-24 rounded-3xl flex items-center justify-center mb-8 relative transition-all duration-500 group-hover:scale-110",
                step.bg,
                step.color
              )}>
                <div className="absolute -top-3 -right-3 size-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                  {step.number}
                </div>
                <step.icon className="size-10" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                {step.title}
              </h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
