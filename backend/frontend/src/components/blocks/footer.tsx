"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#000000] text-white pt-32 pb-12 overflow-hidden border-t border-white/5 font-sans relative">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-32 gap-16">
          <div className="max-w-md">
            <h3 className="text-5xl font-medium tracking-tight mb-6">
              Experience liftoff
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Precision-engineered personal finance tracking for the modern professional. 
              Built for speed, clarity, and total financial control.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24 w-full lg:w-auto">
            <div className="flex flex-col gap-5">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 italic">Legal</span>
              <Link href="/legal/tos" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">Terms & Conditions</Link>
              <Link href="/legal/notice" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">Legal Notice</Link>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 italic">Privacy</span>
              <Link href="/legal/privacy-policy" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">Privacy Policy</Link>
              <Link href="/legal/cookie-policy" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">Cookie Policy</Link>
            </div>
            <div className="flex flex-col gap-5 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 italic">Support</span>
              <a href="mailto:pocketflow.app@gmail.com" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium underline underline-offset-4">Contact Support</a>
            </div>
          </div>
        </div>

        {/* Massive Typography Overlay */}
        <div className="w-full mb-16 text-center pointer-events-none relative">
          <h2 className="text-[12vw] font-black tracking-[-0.05em] leading-none uppercase text-white select-none font-display opacity-[0.02] absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap">
            Pocketflow
          </h2>
          <h2 className="text-[8vw] font-black tracking-[-0.05em] leading-none uppercase text-white select-none font-display relative z-10">
            Pocketflow
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 italic text-center md:text-left">
            <span>© {currentYear} PocketFlow Studio</span>
            <span className="hidden md:block opacity-30">•</span>
            <span>All rights reserved</span>
            <span className="hidden md:block opacity-30">•</span>
            <span className="text-zinc-700">Crafted in Kerala</span>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-emerald-500 transition-colors italic">
              Access Dashboard
            </Link>
            <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full">
              <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Systems Live</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Gradient Flare */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-sm" />
    </footer>
  );
};
