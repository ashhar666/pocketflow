"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Cpu, 
  Globe, 
  Zap, 
  FileJson, 
  Fingerprint,
  ArrowUpRight
} from 'lucide-react';

const bentoItems = [
  {
    title: "Quantum Architecture",
    description: "Zero-latency data synchronization across global nodes. Built for high-velocity capital management.",
    icon: Cpu,
    className: "md:col-span-2 md:row-span-2 bg-white/[0.02]",
    delay: 0.1
  },
  {
    title: "Registry Core",
    description: "Military-grade RSA-4096 encryption for every transaction index.",
    icon: Shield,
    className: "md:col-span-1 md:row-span-1 bg-indigo-500/5 border-indigo-500/10",
    delay: 0.2
  },
  {
    title: "Global Liquidity",
    description: "Real-time exchange engine supporting 150+ fiat and digital assets.",
    icon: Globe,
    className: "md:col-span-1 md:row-span-2 bg-white/[0.02]",
    delay: 0.3
  },
  {
    title: "Identity Layer",
    description: "Biometric and passkey-based access for absolute account sovereignty.",
    icon: Fingerprint,
    className: "md:col-span-1 md:row-span-1 bg-white/[0.02]",
    delay: 0.4
  },
  {
    title: "Automated Intelligence",
    description: "Predictive neural networks for autonomous expense classification.",
    icon: Zap,
    className: "md:col-span-1 md:row-span-1 bg-violet-500/5 border-violet-500/10",
    delay: 0.5
  },
  {
    title: "Manifest Exports",
    description: "Generate cryptographically signed financial statements in PDF or JSON.",
    icon: FileJson,
    className: "md:col-span-1 md:row-span-1 bg-white/[0.02]",
    delay: 0.6
  }
];

export const BentoGridSection = () => {
  return (
    <section className="py-32 bg-[#030303] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">

          <p className="max-w-md text-zinc-500 font-medium leading-relaxed">
            The foundation of a wealth engine is built on absolute reliability. 
            Explore the core capabilities of the Expense Tracker ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-3 gap-4">
          {bentoItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: item.delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative rounded-[2rem] border border-white/5 p-8 overflow-hidden transition-all duration-700 hover:border-white/10 ${item.className}`}
            >
              {/* Highlight Glow */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10" />
              
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="size-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <item.icon className="size-6 text-black" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{item.title}</h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">{String(index + 1).padStart(2, "0")} / SYST</span>
                    <ArrowUpRight className="size-4 text-zinc-800 transition-all duration-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>

              {/* Grid Lines Pattern */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/[0.01] to-transparent pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
