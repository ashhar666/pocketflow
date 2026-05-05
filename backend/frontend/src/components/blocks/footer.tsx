"use client";

import React, { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message first.");
      return;
    }

    setIsSending(true);
    try {
      const response = await api.post("/auth/support/", { message });
      toast.success(response.data?.detail || "Message sent! We'll get back to you soon.");
      setMessage("");
    } catch (error: any) {
      console.error("Support submission error:", error);
      const errorMsg = error.response?.data?.detail || "Failed to send message. Please try again later.";
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setIsSending(false);
    }
  };

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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 sm:gap-24 w-full lg:w-auto">
            <div className="flex flex-col gap-5">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 italic">Product</span>
              <Link href="#features" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">Features</Link>
              <Link href="#process" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">How it Works</Link>
              <Link href="#comparison" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">Competitors</Link>
              <Link href="#faq" className="text-zinc-400 hover:text-white transition-colors text-xs font-medium">FAQ</Link>
            </div>
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
              <div className="flex flex-col gap-4">
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's the problem?"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all resize-none h-24"
                />
                <button 
                  onClick={handleSubmit}
                  disabled={isSending}
                  className="group flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending..." : "Send Message"}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
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
            <span className="hidden md:block opacity-30">•</span>
            <span className="text-[8px] opacity-30 normal-case tracking-normal">All trademarks are property of their respective owners.</span>
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
