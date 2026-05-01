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
              <a href="mailto:ashharshahan666@gmail.com" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Contact</a>
            </div>
          </div>
        </div>

        {/* Massive Typography - Refined Scale and Style */}
        <div className="w-full mb-12 text-center">
          <h2 className="text-[8vw] font-black tracking-[-0.05em] leading-none uppercase text-white select-none font-display">
            Pocketflow
          </h2>
        </div>

        </div>
    </footer>
  );
};
