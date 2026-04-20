"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.981 0 1.778-.773 1.778-1.729V1.729C24 .774 23.206 0 22.225 0z" />
  </svg>
);

export default function NebulaFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Welcome to the inner circle.");
      setEmail('');
      setIsSubmitting(false);
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as any
      }
    }
  };

  const footerLinks = {
    Protocol: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Analytics', href: '#' },
      { name: 'Budgets', href: '/budgets' },
      { name: 'Savings', href: '/savings' },
    ],
    Ecosystem: [
      { name: 'Marketplace', href: '#' },
      { name: 'Developer API', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Documentation', href: '#' },
    ],
    Corporate: [
      { name: 'About', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Media Kit', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Security Audit', href: '#' },
    ]
  };

  return (
    <footer className="relative w-full bg-[#020203] pt-40 pb-16 overflow-hidden border-t border-white/[0.03]">
      {/* Dynamic Nebula Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none opacity-40 animate-slow-spin" />
      
      {/* Digital Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

      <motion.div
        className="max-w-7xl mx-auto px-6 relative z-10 w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Upper Integrated Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-32">
          {/* Brand Identity */}
          <div className="lg:col-span-5 space-y-10">
            <motion.div variants={itemVariants} className="flex items-center gap-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-emerald-500/20 transition-colors duration-500" />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-all duration-700 shadow-2xl overflow-hidden bg-white">
                  <Image src="/logo.png" alt="PocketFlow Logo" fill className="object-cover" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                  Pocket<span className="text-emerald-500">Flow</span>
                </span>
                <span className="text-[10px] font-black tracking-[0.4em] text-zinc-600 uppercase mt-1">Advanced FinTech Protocol</span>
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-zinc-500 text-lg leading-relaxed max-w-md">
              The definitive standard in personal finance management. Engineered for precision, built for the future of digital assets.
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              {[
                { code: 'X.COM', href: '#', label: 'X' },
                { code: 'HUB', href: '#', label: 'GH' },
                { code: 'NET', href: '#', label: 'LI' },
                { code: 'EML', href: '#', label: 'EM' }
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-black italic group-hover:scale-110 transition-transform relative z-10">{social.code}</span>
                    <span className="text-[8px] font-bold mt-1 opacity-0 group-hover:opacity-60 transition-opacity uppercase tracking-tighter relative z-10">{social.label}</span>
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Newsletter Glass Card */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-7 p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-500">
                    <span className="text-[10px] font-black italic">[TRM]</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">Sub-Protocol Alpha</span>
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">Stay in the loop</h3>
                <p className="text-zinc-500 max-w-xs">Get the latest updates on features and institutional financial insights.</p>
              </div>

              <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
                <div className="relative flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="terminal@expense.com"
                    className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-black font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 relative group/btn"
                  >
                    <span className="relative z-10">{isSubmitting ? "Syncing..." : "Initialize"}</span>
                    {!isSubmitting && <span className="text-[10px] font-black italic group-hover/btn:translate-x-1 transition-transform">[SND]</span>}
                    <div className="absolute inset-0 bg-emerald-400 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-xl rounded-2xl" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Navigation Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32 pt-20 border-t border-white/[0.03]">
          {Object.entries(footerLinks).map(([title, links]) => (
            <motion.div key={title} variants={itemVariants} className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 italic flex items-center gap-3">
                  <div className="w-3 h-0.5 bg-zinc-800" />
                  {title}
              </h4>
              <ul className="space-y-5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-zinc-400 hover:text-white transition-all text-sm font-bold flex items-center group/link relative"
                    >
                      <span className="text-[10px] font-black mr-2 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-500 italic">[&gt;]</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300 tracking-tight">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Cinematic Backdrop Text */}
        <div className="w-full text-center py-10 mb-16 overflow-hidden select-none border-y border-white/[0.03] pointer-events-none group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[3s] ease-in-out" />
            <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 0.04, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] as any }}
                className="flex flex-col items-center justify-center leading-[0.8]"
            >
                <span className="text-[20vw] font-black tracking-tighter text-white uppercase italic">POCKET</span>
                <span className="text-[20vw] font-black tracking-tighter text-white uppercase italic">FLOW</span>
            </motion.div>
        </div>

        {/* Footer Bottom Metadata */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center gap-10"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.01]">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80 italic">Status: Operational</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-6 italic">
                <span>© {currentYear} PocketFlow</span>
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span className="flex items-center gap-2">
                    Architected with <span className="text-rose-500 font-black italic">LOVE</span> in London
                </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <Link href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-all group italic">
              Network Status <span className="text-[10px] font-black italic group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">[NET]</span>
            </Link>
            <div className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-600 italic">GLB</span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">v2.04.18</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Extreme Bottom Noise/Glow Texture */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-emerald-500/[0.02] to-transparent pointer-events-none" />
      
      <style jsx global>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 30s linear infinite;
        }
      `}</style>
    </footer>
  );
}
