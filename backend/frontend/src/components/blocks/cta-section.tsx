"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/shadcn-button';
import { motion } from 'framer-motion';

export const CTASection = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#030303]">
      {/* Premium Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative group overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-16 md:p-24 text-center shadow-[0_0_80px_-20px_rgba(79,70,229,0.15)]"
        >
          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 space-y-12">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mx-auto"
            >
              <Sparkles className="size-3" />
              <span>Limited Alpha Access</span>
            </motion.div>

            <h2 className="text-5xl md:text-8xl font-black text-white tracking-[-0.04em] leading-[0.85] uppercase italic text-balance">
              Start Your Wealth <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Journey Today</span>
            </h2>

            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Join an elite circle of builders tracking their legacy in real-time. 
              The most sophisticated financial instrument ever built for individuals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                    asChild
                    size="lg"
                    className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all duration-500 shadow-2xl shadow-white/10 text-base font-black uppercase tracking-widest group/btn"
                >
                    <Link href="/register" className="flex items-center gap-3">
                    Establish Legacy
                    <ArrowRight className="size-5 group-hover/btn:translate-x-2 transition-transform duration-500" />
                    </Link>
                </Button>
              </motion.div>
              
              <Link 
                href="/login" 
                className="text-zinc-500 font-black hover:text-white transition-colors text-sm uppercase tracking-[0.2em] flex items-center gap-2 underline decoration-zinc-800 underline-offset-8"
              >
                Existing Citizen?
              </Link>
            </div>

            <div className="pt-16 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/5 opacity-40">
              <div className="flex flex-col gap-1 items-center md:items-start text-left">
                <span className="text-white font-black text-xs uppercase tracking-widest">Privacy</span>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Zero-Knowledge Data</span>
              </div>
              <div className="flex flex-col gap-1 items-center md:items-start text-left">
                <span className="text-white font-black text-xs uppercase tracking-widest">Global</span>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Multi-Currency Engine</span>
              </div>
              <div className="hidden md:flex flex-col gap-1 items-start text-left">
                <span className="text-white font-black text-xs uppercase tracking-widest">Automation</span>
                <span className="text-[10px] uppercase font-bold text-zinc-500">AI-Powered Insights</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
