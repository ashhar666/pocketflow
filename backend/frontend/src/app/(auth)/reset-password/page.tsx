'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AuthPage } from '@/components/ui/auth-page';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      router.push('/login');
    }
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const password_confirm = formData.get('password_confirm') as string;

    if (password !== password_confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password/', { 
        token,
        new_password: password 
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthPage
        mode="reset-password"
        heroImageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=2160&q=80"
      >
        <div className="space-y-8">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                  <polyline points="20 6 9 17 4 12" />
               </svg>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Security Updated</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Your password has been successfully reset. You can now log in with your new credentials.
            </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login')}
            className="w-full rounded-2xl bg-white text-black py-5 font-black hover:bg-emerald-500 hover:text-white transition-all text-xs uppercase tracking-[0.3em] italic"
          >
            Go to Login
          </motion.button>
        </div>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      mode="reset-password"
      onSubmit={handleSubmit}
      isLoading={loading}
      heroImageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=2160&q=80"
    />
  );
}
