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

export default function ZenFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Welcome! You've joined our waitlist.");
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const footerLinks = {
    product: [
      { name: 'Home', href: '/' },
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Roadmap', href: '#' },
    ],
    dashboard: [
      { name: 'Overview', href: '/dashboard' },
      { name: 'Expenses', href: '/expenses' },
      { name: 'Budgets', href: '/budgets' },
      { name: 'Savings', href: '/savings' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ]
  };

  return (
    <footer className="relative w-full bg-zinc-950 pt-32 pb-12 overflow-hidden border-t border-white/5">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        className="max-w-7xl mx-auto px-6 relative z-10 w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Upper Brand & Newsletter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24">
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl shadow-white/10 overflow-hidden bg-white relative">
                <Image src="/logo.png" alt="PocketFlow Logo" fill className="object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                Pocket<span className="text-emerald-500">Flow</span>
              </span>
            </motion.div>

            <motion.p variants={itemVariants} className="text-zinc-400 text-lg max-w-md leading-relaxed">
              Master your money with the world&apos;s most intuitive expense engine. Built for individuals who demand precision and elegance.
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              {[
                { label: 'X', code: 'X.COM', href: '#' },
                { label: 'GH', code: 'HUB', href: '#' },
                { label: 'LI', code: 'NET', href: '#' },
                { label: 'EM', code: 'EML', href: '#' }
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group relative overflow-hidden"
                >
                  <span className="text-[9px] font-black italic group-hover:scale-110 transition-transform relative z-10">{social.code}</span>
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl space-y-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <h3 className="text-xl font-bold text-white relative z-10">Stay in the loop</h3>
            <p className="text-zinc-500 relative z-10">Get the latest updates on features and financial insights.</p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 relative z-10">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-8 py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Subscribe"}
                {!isSubmitting && <span className="text-[10px] font-black italic">[SND]</span>}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32 border-t border-white/5 pt-20">
          {Object.entries(footerLinks).map(([title, links]) => (
            <motion.div key={title} variants={itemVariants} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center group/link"
                    >
                      <span className="text-[10px] font-black mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-emerald-500 italic">[&gt;]</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Giant Text Banner */}
        <div className="w-full text-center py-10 mb-10 overflow-hidden select-none border-y border-white/5 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 0.05, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center leading-[0.8]"
          >
            <span className="text-[18vw] font-black tracking-tighter text-white uppercase italic">POCKET</span>
            <span className="text-[18vw] font-black tracking-tighter text-white uppercase italic">FLOW</span>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest italic"
        >
          <div className="flex items-center gap-6 text-zinc-600">
            <span>© {currentYear} PocketFlow</span>
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <span className="flex items-center gap-1">
              Made with <span className="text-rose-500 font-black italic">LOVE</span> by Antigravity
            </span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02]">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-emerald-500/80">Systems Nominal</span>
            </div>
            <Link href="#" className="flex items-center gap-1 text-zinc-600 hover:text-white transition-colors">
              Server Status <span className="text-[10px] font-black italic">[&gt;]</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Texture */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
    </footer>
  );
}
