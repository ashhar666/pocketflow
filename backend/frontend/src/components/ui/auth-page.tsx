"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

interface AuthPageProps {
  mode: 'login' | 'register';
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn(
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300",
    "focus-within:border-indigo-500/50 focus-within:bg-indigo-500/10 focus-within:ring-1 focus-within:ring-indigo-500/20",
    "h-14 flex items-center",
    className
  )}>
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  title,
  description,
  heroImageSrc = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=2160&q=80", // Default financial theme
  onSubmit,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans w-full bg-[#030303] text-zinc-100 overflow-x-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Left column: auth form */}
      <section className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-20 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <div className="flex flex-col gap-10">
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                   <Sparkles className="size-3" />
                   <span>{mode === 'login' ? 'Welcome Back' : 'Early Access'}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-[ -0.05em] uppercase italic text-white">
                    {title || (mode === 'login' ? "Elevate \nYour Wealth" : "Start Your \nLegacy")}
                </h1>
                <p className="text-zinc-400 font-medium text-lg max-w-[20ch]">
                    {description || (mode === 'login' ? "Log in to track your wealth." : "Start your financial journey today.")}
                </p>
            </motion.div>

            <form className="space-y-6" onSubmit={onSubmit}>
              {mode === 'register' && (
                <motion.div variants={itemVariants} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 block ml-1">Account Identity</label>
                    <GlassInputWrapper>
                      <UserIcon className="ml-5 size-5 text-zinc-500" />
                      <input name="username" type="text" placeholder="Username" required className="w-full bg-transparent text-sm p-4 focus:outline-none placeholder:text-zinc-600" />
                    </GlassInputWrapper>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <GlassInputWrapper>
                        <input name="first_name" type="text" placeholder="First Name" className="w-full bg-transparent text-sm p-4 focus:outline-none placeholder:text-zinc-600" />
                    </GlassInputWrapper>
                    <GlassInputWrapper>
                        <input name="last_name" type="text" placeholder="Last Name" className="w-full bg-transparent text-sm p-4 focus:outline-none placeholder:text-zinc-600" />
                    </GlassInputWrapper>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                {mode === 'login' && <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 block ml-1">Security Credentials</label>}
                <GlassInputWrapper>
                  <Mail className="ml-5 size-5 text-zinc-500" />
                  <input name="email" type="email" placeholder="Email Address" required className="w-full bg-transparent text-sm p-4 focus:outline-none placeholder:text-zinc-600" />
                </GlassInputWrapper>
              </motion.div>

              <motion.div variants={itemVariants}>
                <GlassInputWrapper>
                    <Lock className="ml-5 size-5 text-zinc-500" />
                    <div className="relative flex-1">
                        <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" required className="w-full bg-transparent text-sm p-4 pr-12 focus:outline-none placeholder:text-zinc-600" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center">
                            {showPassword ? <EyeOff className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />}
                        </button>
                    </div>
                </GlassInputWrapper>
              </motion.div>

              {mode === 'register' && (
                <motion.div variants={itemVariants}>
                    <GlassInputWrapper>
                        <Lock className="ml-5 size-5 text-zinc-500" />
                        <input name="password_confirm" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" required className="w-full bg-transparent text-sm p-4 focus:outline-none placeholder:text-zinc-600" />
                    </GlassInputWrapper>
                </motion.div>
              )}

              {mode === 'login' && (
                <motion.div variants={itemVariants} className="flex items-center justify-between text-xs px-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                      <span className="text-zinc-500 font-bold uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Remember</span>
                    </label>
                    <Link href="/forgot-password" className="font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-[0.1em]">Forgot?</Link>
                </motion.div>
              )}

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-5 font-black text-white hover:shadow-2xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-[0.2em]"
              >
                {isLoading ? "Synchronizing..." : (mode === 'login' ? "Access Dashboard" : "Create Account")}
                {!isLoading && <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="relative flex items-center justify-center">
              <span className="w-full border-t border-white/5"></span>
              <span className="px-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 bg-[#030303] absolute">Alternative Access</span>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              type="button" 
              className="w-full flex items-center justify-center gap-3 border border-white/5 rounded-2xl py-5 transition-all font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-white"
            >
                <GoogleIcon />
                <span>Google Auth</span>
            </motion.button>

            <motion.p variants={itemVariants} className="text-center text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
              {mode === 'login' ? "New Builder?" : "Existing Citizen?"}{' '}
              <Link href={mode === 'login' ? "/register" : "/login"} className="text-white hover:text-indigo-400 transition-colors ml-2 underline decoration-white/20 underline-offset-4">
                {mode === 'login' ? "Register" : "Sign In"}
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Right column: hero image */}
      <section className="hidden lg:block flex-1 relative p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-6 rounded-[3rem] bg-cover bg-center overflow-hidden group shadow-2xl border border-white/5" 
          style={{ backgroundImage: `url(${heroImageSrc})` }}
        >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-transparent opacity-80" />
        </motion.div>
      </section>
    </div>
  );
};
