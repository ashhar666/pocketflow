"use client";

import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

export const Footer = () => {
  return (
    <footer className="py-24 border-t border-border/10 bg-background transition-colors duration-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic mb-4">
              Expense <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-zinc-500">Tracker</span>
            </h3>
            <p className="text-zinc-500 font-medium max-w-xs text-sm leading-relaxed uppercase tracking-widest italic">
              High-Precision Wealth Management & AI-Driven Intelligence.
            </p>
          </div>


          {/* Secondary Links/Info */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <div className="flex items-center gap-6">
              <a href="/legal/privacy-policy" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic">Privacy</a>
              <a href="/legal/tos" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic">Terms</a>
              <a href="/legal/cookie-policy" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic">Cookies</a>
              <a href="/dashboard" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic">Console</a>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">
              &copy; {new Date().getFullYear()} Paisa Command Protocols.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
