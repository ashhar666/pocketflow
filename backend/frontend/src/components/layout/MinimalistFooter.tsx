import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

export default function MinimalistFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Subscribed to the newsletter.");
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  const footerLinks = {
    Product: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Analytics', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Roadmap', href: '#' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ]
  };

  return (
    <footer className="w-full bg-zinc-950 text-zinc-400 py-24 px-6 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-24">
          {/* Brand and Mission */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 text-white">
              <div className="w-5 h-5 rounded-md flex items-center justify-center overflow-hidden bg-white">
                <img src="/logo.png" alt="PocketFlow Logo" className="size-full object-cover" />
              </div>
              <span className="text-xl font-bold tracking-tight">PocketFlow</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs grayscale">
              Precise personal finance tracking for the modern professional. Built with focus and simplicity in mind.
            </p>
            <div className="flex items-center gap-5 pt-2">
              <Link href="#" className="hover:text-white transition-colors text-[10px] font-black underline italic">X.COM</Link>
              <Link href="#" className="hover:text-white transition-colors text-[10px] font-black underline italic">HUB</Link>
              <Link href="#" className="hover:text-white transition-colors text-[10px] font-black underline italic">EML</Link>
            </div>
          </div>

          {/* Links Grid */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-6">
              <h4 className="text-sm font-semibold text-white tracking-wide">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors flex items-center group">
                      <span className="text-[10px] font-black mr-2 opacity-50 group-hover:opacity-100 transition-opacity">↗</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter (Minimalist) */}
          <div className="lg:col-span-1 space-y-6">
            <h4 className="text-sm font-semibold text-white tracking-wide">Newsletter</h4>
            <div className="space-y-4">
              <p className="text-xs">Updates and insights, monthly.</p>
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  SND
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium">
          <div className="flex items-center gap-6">
            <span>© {currentYear} PocketFlow</span>
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <span className="text-zinc-600 uppercase tracking-widest text-[9px]">Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
