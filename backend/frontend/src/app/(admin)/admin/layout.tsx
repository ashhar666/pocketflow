'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?from=/admin');
      } else if (!user?.is_staff) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || !user?.is_staff) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Staff Portal</h1>
            <p className="text-gray-500 font-medium">Platform-wide analytics and support</p>
          </div>
          <nav className="flex gap-2">
            <a href="/admin" className="px-4 py-2 bg-white text-black text-xs font-bold uppercase rounded-none hover:bg-gray-200 transition-colors">Dashboard</a>
            <a href="/admin/support" className="px-4 py-2 border border-white/20 text-white text-xs font-bold uppercase rounded-none hover:bg-white/5 transition-colors">Support</a>
            <a href="/dashboard" className="px-4 py-2 border border-white/20 text-white text-xs font-bold uppercase rounded-none hover:bg-white/5 transition-colors">Back to App</a>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
