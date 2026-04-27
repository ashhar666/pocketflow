"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#000000] text-white pt-32 pb-16 overflow-hidden relative border-t border-white/5">
      {/* Massive Background Typography - Inspired by Antigravity */}
      <div className="absolute bottom-0 left-0 w-full text-center pointer-events-none select-none opacity-[0.05] transform translate-y-1/4">
        <h2 className="text-[28vw] font-black tracking-tighter leading-none uppercase italic">
          Pocketflow
        </h2>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-48 gap-16">
          <div className="max-w-xl">
            <h3 className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.1]">
              Experience financial <br />
              <span className="text-zinc-500 italic">liftoff.</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-12 md:gap-32 w-full md:w-auto">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Legal</h4>
              <nav className="flex flex-col gap-4 text-sm font-medium">
                <Link href="/legal/privacy-policy" className="text-zinc-400 hover:text-white transition-all hover:translate-x-1 duration-300">Privacy</Link>
                <Link href="/legal/tos" className="text-zinc-400 hover:text-white transition-all hover:translate-x-1 duration-300">Terms</Link>
                <Link href="/legal/cookie-policy" className="text-zinc-400 hover:text-white transition-all hover:translate-x-1 duration-300">Cookies</Link>
              </nav>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Support</h4>
              <nav className="flex flex-col gap-4">
                <a 
                  href="mailto:support@pocketflow.com" 
                  className="group flex items-center gap-3 text-sm font-semibold hover:text-emerald-400 transition-colors"
                >
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-emerald-500/10 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  Contact Support
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-black text-xs italic">PF</span>
            </div>
            <span className="text-lg font-bold tracking-tighter uppercase italic">PocketFlow</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/legal/tos" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/legal/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
