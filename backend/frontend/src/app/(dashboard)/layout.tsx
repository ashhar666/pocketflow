'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { navItems } from '@/components/layout/Sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show nothing while loading or if unauthenticated (prevents flash of content)
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-400">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-20 md:pb-0 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {/* Mobile Header / Theme Toggle */}
          <div className="md:hidden sticky top-0 z-[100] flex items-center justify-between mb-8 bg-background/80 backdrop-blur-xl p-4 rounded-b-2xl border-b border-x border-black/5 dark:border-white/10 shadow-sm print:hidden">
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-foreground font-black italic shadow-inner">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-foreground uppercase italic truncate tracking-tight">{user?.first_name || user?.username}</p>
                <p className="text-[10px] text-zinc-600 font-medium truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(true)}
                className="px-3 py-1.5 text-[10px] font-black uppercase italic tracking-widest text-zinc-600 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all duration-300 border border-black/5 dark:border-white/5 shadow-sm"
              >
                Menu
              </motion.button>
            </div>
          </div>

          {/* Slide-Out Menu Drawer */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm md:hidden"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 bottom-0 z-[1001] w-[280px] bg-background border-l border-black/5 dark:border-white/10 shadow-2xl md:hidden flex flex-col"
                >
                  <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-500/5 dark:bg-white/[0.02]">
                    <span className="font-black italic uppercase tracking-widest text-lg">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="size-8 flex items-center justify-center rounded-full bg-zinc-500/10 text-zinc-500 hover:text-foreground hover:bg-zinc-500/20 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    <div className="px-2 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500 italic">More Links</span>
                    </div>
                    {navItems.slice(5).map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link 
                          key={item.name} 
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500 hover:text-foreground'}`}
                        >
                          <Icon className="size-5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-black text-xs uppercase italic tracking-tight">{item.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.02]">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-3 px-3 py-3 text-[10px] font-black uppercase italic tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-red-500/20 shadow-sm"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
