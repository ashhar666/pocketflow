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
              Expense Tracker
            </span>
          </div>

          {/* Minimal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
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
            <Link 
              href="/legal/cookie-policy" 
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors cursor-pointer"
            >
              Cookies
            </Link>
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
