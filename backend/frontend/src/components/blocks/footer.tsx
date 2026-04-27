"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#000000] text-white pt-32 pb-12 overflow-hidden border-t border-white/5 font-sans">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-24">
          <div>
            <h3 className="text-4xl font-medium tracking-tight">
              Experience liftoff
            </h3>
          </div>

          <div className="flex gap-24 mt-12 md:mt-0">
            <div className="flex flex-col gap-3">
              <Link href="/legal/privacy-policy" className="text-zinc-400 hover:text-white transition-colors text-sm">Privacy</Link>
              <Link href="/legal/tos" className="text-zinc-400 hover:text-white transition-colors text-sm">Terms</Link>
              <Link href="/legal/cookie-policy" className="text-zinc-400 hover:text-white transition-colors text-sm">Cookies</Link>
            </div>
            <div className="flex flex-col gap-3">
              <a href="mailto:ashharshahan666@gmail.com" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Contact</a>
            </div>
          </div>
        </div>

        {/* Massive Typography - Exact Antigravity Style */}
        <div className="w-full mb-12">
          <h2 className="text-[18vw] font-black tracking-[-0.05em] leading-none uppercase text-white select-none">
            Pocketflow
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <span className="text-lg font-bold tracking-tighter uppercase">PocketFlow</span>
          </div>

          <div className="flex items-center gap-8 text-[12px] text-zinc-500 font-medium">
            <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/tos" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/legal/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
