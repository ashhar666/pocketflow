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
              Expense <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-zinc-500">Tracker</span>
            </h3>
          </div>


          {/* Secondary Links/Info */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <div className="flex items-center gap-6">
              <Link href="/legal/privacy-policy" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer">Privacy</Link>
              <Link href="/legal/tos" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer">Terms</Link>
              <Link href="/legal/cookie-policy" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer">Cookies</Link>
              <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-colors italic cursor-pointer">Console</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
