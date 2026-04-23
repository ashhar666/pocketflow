"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/5 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
            <span className="text-sm font-black tracking-[0.3em] uppercase italic text-foreground">
              PocketFlow
            </span>
          </div>

          {/* Minimal Links & Contact */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-4">
            <a 
              href="mailto:support@pocketflow.com" 
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors cursor-pointer"
            >
              Support
            </a>
            <Link 
              href="/legal/privacy-policy" 
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy
            </Link>
            <Link 
              href="/legal/tos" 
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors cursor-pointer"
            >
              Terms
            </Link>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">
                Operational
              </span>
            </div>

            <div className="w-px h-3 bg-zinc-800 hidden md:block" />
            <Link 
              href="/dashboard" 
              className="px-4 py-1.5 border border-foreground/10 rounded-full text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all italic active:scale-95"
            >
              Open Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
