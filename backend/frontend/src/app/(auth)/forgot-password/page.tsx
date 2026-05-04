'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AuthPage } from '@/components/ui/auth-page';
import { motion } from 'framer-motion';

type Step = 'form' | 'sent';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email: emailValue });
      setStep('sent');
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === 'sent') {
    return (
      <AuthPage
        mode="forgot-password"
        heroImageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=2160&q=80"
      >
        <div className="space-y-8">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500">
                  <polyline points="20 6 9 17 4 12" />
               </svg>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Check Your Email</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              If an account exists for <span className="text-white italic">{email}</span>, we&apos;ve sent a password reset link.
            </p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login')}
            className="w-full rounded-2xl bg-white text-black py-5 font-black hover:bg-emerald-500 hover:text-white transition-all text-xs uppercase tracking-[0.3em] italic"
          >
            Back to Login
          </motion.button>
        </div>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      mode="forgot-password"
      onSubmit={handleSubmit}
      isLoading={loading}
      heroImageSrc="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=2160&q=80"
    />
  );
}
