"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- HELPER COMPONENTS ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password';
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleClick?: () => void;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  children?: React.ReactNode;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children, label, className }: { children: React.ReactNode, label?: string, className?: string }) => (
  <div className={cn(
    "rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all duration-300 group/input",
    "focus-within:border-emerald-500/30 focus-within:bg-emerald-500/[0.05]",
    "h-14 flex items-center relative overflow-hidden",
    className
  )}>
    {label && (
      <div className="pl-5 flex items-center justify-center pointer-events-none">
        <span className="text-[8px] font-black italic tracking-tighter text-zinc-500 group-focus-within/input:text-emerald-500 transition-colors uppercase border border-zinc-500/20 group-focus-within/input:border-emerald-500/20 px-1 rounded-sm">
          {label}
        </span>
      </div>
    )}
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  title,
  description,
  heroImageSrc = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=2160&q=80",
  onSubmit,
  onGoogleClick,
  isLoading = false,
  isGoogleLoading = false,
  children,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans w-full bg-[#030303] text-zinc-100 overflow-x-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/2 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] italic mb-2">
                   <span>
                    {mode === 'login' ? 'LOG IN' : 
                     mode === 'register' ? 'REGISTER' : 
                     mode === 'forgot-password' ? 'RECOVERY' : 'RESET'}
                   </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-[0.85] tracking-[-0.08em] uppercase italic text-white whitespace-pre-line">
                    {title || (
                      mode === 'login' ? "Welcome \nBack" : 
                      mode === 'register' ? "Create \nAccount" :
                      mode === 'forgot-password' ? "Reset \nPassword" : "Set New \nPassword"
                    )}
                </h1>
                <p className="text-zinc-500 font-medium text-sm max-w-[28ch] uppercase tracking-widest leading-relaxed">
                    {description || (
                      mode === 'login' ? "Log in to your account." : 
                      mode === 'register' ? "Join PocketFlow today." :
                      mode === 'forgot-password' ? "Enter your email for a reset link." : "Enter your new password below."
                    )}
                </p>
            </motion.div>

            {children ? (
              <motion.div variants={itemVariants}>
                {children}
              </motion.div>
            ) : (
              <>
                <form className="space-y-6" onSubmit={onSubmit}>
                  {mode === 'register' && (
                    <motion.div variants={itemVariants} className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-3 block ml-1 italic">User Details</label>
                        <GlassInputWrapper label="USER">

                          <input name="username" type="text" placeholder="Username" required className="w-full bg-transparent text-xs p-4 focus:outline-none placeholder:text-zinc-700 font-bold tracking-tight" />
                        </GlassInputWrapper>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <GlassInputWrapper>
                            <input name="first_name" type="text" placeholder="First Name" className="w-full bg-transparent text-xs p-4 focus:outline-none placeholder:text-zinc-700 font-bold tracking-tight" />
                        </GlassInputWrapper>
                        <GlassInputWrapper>
                            <input name="last_name" type="text" placeholder="Last Name" className="w-full bg-transparent text-xs p-4 focus:outline-none placeholder:text-zinc-700 font-bold tracking-tight" />
                        </GlassInputWrapper>
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    {(mode === 'login' || mode === 'forgot-password') && <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-3 block ml-1 italic">
                      {mode === 'login' ? 'Login Details' : 'Account Details'}
                    </label>}
                    <GlassInputWrapper label="EMAIL">

                      <input name="email" type="email" placeholder="Email Address" required className="w-full bg-transparent text-xs p-4 focus:outline-none placeholder:text-zinc-700 font-bold tracking-tight" />
                    </GlassInputWrapper>
                  </motion.div>

                  {(mode !== 'forgot-password') && (
                    <motion.div variants={itemVariants}>
                      <GlassInputWrapper label="PASS">

                          <div className="relative flex-1">
                              <input name="password" type={showPassword ? 'text' : 'password'} placeholder={mode === 'reset-password' ? "New Password" : "Password"} required className="w-full bg-transparent text-xs p-4 pr-16 focus:outline-none placeholder:text-zinc-700 font-bold tracking-tight" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center text-[10px] font-black italic text-zinc-600 hover:text-emerald-500 transition-colors uppercase tracking-tighter">
                                  {showPassword ? "HIDE" : "SHOW"}
                              </button>
                          </div>
                      </GlassInputWrapper>
                    </motion.div>
                  )}

                  {(mode === 'register' || mode === 'reset-password') && (
                    <motion.div variants={itemVariants}>
                        <GlassInputWrapper label="CONFIRM">

                            <input name="password_confirm" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" required className="w-full bg-transparent text-xs p-4 focus:outline-none placeholder:text-zinc-700 font-bold tracking-tight" />
                        </GlassInputWrapper>
                    </motion.div>
                  )}

                  {mode === 'login' && (
                    <motion.div variants={itemVariants} className="flex items-center justify-between text-[10px] px-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                          <span className="text-zinc-600 font-bold uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Remember Me</span>
                        </label>
                        <Link href="/forgot-password" className="font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-[0.15em] italic">Forgot Password?</Link>
                    </motion.div>
                  )}


                  <motion.button 
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(16,185,129,0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-white text-black py-5 font-black hover:bg-emerald-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-[0.3em] italic"
                  >
                    {isLoading ? "LOADING..." : (
                      mode === 'login' ? "Log In" : 
                      mode === 'register' ? "Register" :
                      mode === 'forgot-password' ? "Send Link" : "Reset Password"
                    )}

                    {!isLoading && <span className="text-[10px] group-hover:translate-x-1 transition-transform">→</span>}
                  </motion.button>
                </form>

                {(mode === 'login' || mode === 'register') && (
                  <>
                    <motion.div variants={itemVariants} className="relative flex items-center justify-center">
                      <span className="w-full border-t border-white/5"></span>
                      <span className="px-6 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 bg-[#030303] absolute italic">Or continue with</span>
                    </motion.div>

                    <motion.button 
                      variants={itemVariants}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                      type="button" 
                      onClick={onGoogleClick}
                      disabled={isGoogleLoading || isLoading}
                      className="w-full flex items-center justify-center gap-3 border border-white/5 rounded-2xl py-4 transition-all font-black text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white italic disabled:opacity-50"
                    >
                        <GoogleIcon />
                        <span>{isGoogleLoading ? 'CONNECTING...' : 'Google'}</span>
                    </motion.button>
                  </>
                )}

                <motion.p variants={itemVariants} className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  {mode === 'login' ? "New user?" : 
                   mode === 'register' ? "Already have an account?" : 
                   mode === 'forgot-password' ? "Remember your password?" : "Back to"}
                  {' '}
                  <Link href={
                    (mode === 'login') ? "/register" : "/login"
                  } className="text-white hover:text-emerald-500 transition-colors ml-2 underline decoration-white/20 underline-offset-[6px]">
                    {mode === 'register' ? "Log In" : "Register"}
                  </Link>
                </motion.p>
              </>
            )}

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
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-transparent opacity-90" />
            
            <div className="absolute bottom-12 left-12 right-12">
               <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4 italic border-l border-emerald-500 pl-4">System Verification</div>
               <h2 className="text-4xl font-black text-white uppercase italic leading-none tracking-tighter mb-4">Autonomous <br/>Wealth Management</h2>
               <p className="text-zinc-400 text-xs uppercase tracking-[0.2em] max-w-sm leading-relaxed">Financial infrastructure built for high-density capital distribution and systematic accumulation.</p>
            </div>
        </motion.div>
      </section>
    </div>
  );
};
