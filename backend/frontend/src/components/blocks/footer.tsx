"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const Footer = () => {
  return (
    <footer className="py-24 border-t border-border/10 bg-background transition-colors duration-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
              Pocket<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-zinc-500">Flow</span>
            </h3>
          </div>


          {/* Secondary Links/Info */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-6">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-4">
              <a 
                href="mailto:support@pocketflow.com" 
                className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer"
              >
                Contact
              </a>
              <Link href="/legal/privacy-policy" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer">Privacy</Link>
              <Link href="/legal/tos" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer">Terms</Link>
              <Link href="/legal/cookie-policy" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer">Cookies</Link>
              <div className="w-px h-3 bg-zinc-800 hidden md:block" />
              <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-foreground hover:text-foreground transition-colors italic cursor-pointer">Console</Link>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full w-fit">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">
                System Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
