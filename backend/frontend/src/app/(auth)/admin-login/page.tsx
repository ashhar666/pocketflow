'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.is_staff) {
      router.replace('/admin');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast.error("Credentials required for uplink.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login/', { email, password });
      const userData = response.data.user;
      
      if (!userData.is_staff) {
        toast.error("Access denied. Admin credentials required.");
        setIsLoading(false);
        return;
      }

      login(userData);
      toast.success("Uplink established. Welcome, Administrator.");
      router.push('/admin');
    } catch (error: any) {
      console.error("Admin Login Error:", error.response?.data || error.message);
      toast.error("Authentication failed. Connection terminated.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center size-16 rounded-3xl bg-white/[0.03] border border-white/10 mb-6 shadow-2xl">
            <ShieldCheck className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Staff Access</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">PocketFlow Command Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                name="email"
                type="email"
                placeholder="ADMIN@POCKET-FLOW.APP"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                name="password"
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full group flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Establish Connection"}
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 italic">
            This terminal is monitored for security purposes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
