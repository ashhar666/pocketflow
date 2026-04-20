"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/shadcn-button';
import { motion, useReducedMotion } from 'framer-motion';

export const CTASection = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative py-48 px-6 overflow-hidden bg-[#030303]">
      {/* Decorative Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob w-[1000px] h-[1000px] bg-indigo-600/30 -left-1/4 -top-1/4" />
        <div className="aurora-blob w-[800px] h-[800px] bg-violet-600/20 -right-1/4 -bottom-1/4" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-16 md:p-32 text-center relative overflow-hidden group"
        >
          {/* Internal Mesh Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 space-y-12">
            <motion.div 
              initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mx-auto italic"
            >
              <span className="text-[10px] font-black italic">[NEW]</span>
              <span>Priority Enrollment Open</span>
            </motion.div>

            <h2 className="text-6xl md:text-9xl font-black text-white tracking-[-0.05em] leading-[0.8] uppercase italic text-balance">
              Establish Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">Digital Legacy</span>
            </h2>

            <p className="text-zinc-500 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
              Step into the future of capital management. Join an elite circle of users tracking their wealth with military precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-8">
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              >
                <Button 
                    asChild
                    size="lg"
                    className="h-20 px-16 rounded-[2rem] bg-white text-black hover:bg-zinc-200 transition-all duration-500 shadow-[0_0_50px_-12px_rgba(255,255,255,0.3)] text-lg font-black uppercase tracking-[0.2em] group/btn"
                >
                    <Link href="/register" className="flex items-center gap-4 italic">
                    Establish Access
                    <span className="group-hover/btn:translate-x-2 transition-transform duration-500 font-black italic">[&gt;&gt;]</span>
                    </Link>
                </Button>
              </motion.div>
              
              <Link 
                href="/login" 
                className="text-zinc-500 font-black hover:text-white transition-colors text-xs uppercase tracking-[0.3em] flex items-center gap-2 underline decoration-zinc-800 underline-offset-8 italic"
              >
                Existing Operator?
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Floating Trust Metrics */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 px-8 opacity-50">
          <div className="space-y-1">
            <p className="text-white font-black text-sm uppercase tracking-widest italic">Encrypted</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Military Standard AES-256</p>
          </div>
          <div className="space-y-1 border-l border-white/5 pl-8">
            <p className="text-white font-black text-sm uppercase tracking-widest italic">Distributed</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Multi-Region Redundancy</p>
          </div>
          <div className="space-y-1 border-l border-white/5 pl-8">
            <p className="text-white font-black text-sm uppercase tracking-widest italic">Neutral</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Non-Custodial Insights</p>
          </div>
          <div className="space-y-1 border-l border-white/5 pl-8">
            <p className="text-white font-black text-sm uppercase tracking-widest italic">Universal</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Multi-Asset Correlation</p>
          </div>
        </div>
      </div>
    </section>
  );
};
