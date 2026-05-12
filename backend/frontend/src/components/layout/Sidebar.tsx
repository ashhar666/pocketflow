'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  CircleArrowUp, 
  CircleArrowDown, 
  Tags, 
  Wallet, 
  PiggyBank, 
  Send, 
  Settings,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, role: 'user' },
  { name: 'Reports', href: '/reports', icon: BarChart3, role: 'user' },
  { name: 'Income', href: '/income', icon: CircleArrowUp, role: 'user' },
  { name: 'Expenses', href: '/expenses', icon: CircleArrowDown, role: 'user' },
  { name: 'Categories', href: '/categories', icon: Tags, role: 'user' },
  { name: 'Budgets', href: '/budgets', icon: Wallet, role: 'user' },
  { name: 'Savings', href: '/savings', icon: PiggyBank, role: 'user' },
  { name: 'Telegram', href: '/telegram', icon: Send, role: 'user' },
  { name: 'Settings', href: '/settings', icon: Settings, role: 'both' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen bg-background border-r border-border dark:border-white/10 sticky top-0 overflow-hidden transition-colors duration-400 print:hidden z-[10001]">
        <div className="pt-10 p-6 pb-4">
          <Link href="/" className="flex items-center group/logo">
            <div className="flex flex-col -space-y-0.5 ml-1">
              <span className="font-bold text-base tracking-tighter text-foreground uppercase leading-none">PocketFlow</span>
              <div className="flex items-center gap-1.5">
                <div className="size-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-zinc-500">App Ready</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">

          {/* Admin section — only visible to staff */}
          {user?.is_staff && (
            <>
              <div className="px-3 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-red-500/60">Admin</span>
              </div>
              <Link href="/admin">
                <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 group ${pathname === '/admin' ? 'text-foreground' : 'text-zinc-500 hover:text-foreground hover:bg-zinc-500/5 dark:hover:bg-white/[0.02]'}`}>
                  {pathname === '/admin' && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-red-500/5 border border-red-500/10 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <ShieldCheck className={`size-4 relative z-10 transition-colors duration-500 ${pathname === '/admin' ? 'text-red-500' : 'group-hover:text-red-400'}`} strokeWidth={pathname === '/admin' ? 2.5 : 2} />
                  <span className="font-bold text-xs uppercase tracking-widest relative z-10">Command Center</span>
                </div>
              </Link>
              <div className="mx-3 my-3 border-t border-white/5" />
              <div className="px-3 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-700">Main Menu</span>
              </div>
            </>
          )}

          {!user?.is_staff && (
            <div className="px-3 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-700">Main Menu</span>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 group ${isActive ? 'text-foreground' : 'text-zinc-500 hover:text-foreground hover:bg-zinc-500/5 dark:hover:bg-white/[0.02]'}`}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`size-4 relative z-10 transition-colors duration-500 ${isActive ? 'text-emerald-500' : 'group-hover:text-emerald-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-bold text-xs uppercase tracking-widest relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-black/5 dark:border-white/10 bg-zinc-500/5 dark:bg-black shrink-0">
          <div className="px-3 py-3 mb-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.02] flex items-center gap-3 shadow-sm">
            <div className="size-10 shrink-0 rounded-full bg-zinc-200 dark:bg-black border border-black/5 dark:border-white/10 flex items-center justify-center text-foreground font-bold shadow-inner">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground uppercase truncate tracking-tight leading-none mb-0.5">{user?.first_name || user?.username}</p>
              <p className="text-[10px] text-zinc-600 font-medium truncate opacity-70">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="size-3.5 group-hover:rotate-12 transition-transform" />
            Log Out
          </button>
        </div>
      </aside>



      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-4 inset-x-4 z-[10001] bg-background/80 dark:bg-black backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl safe-area-bottom px-2 transition-colors duration-400">
        <div className="flex items-center h-16 relative overflow-x-auto no-scrollbar gap-2 px-2">
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center min-w-[70px] h-full relative transition-all duration-300">
                {isActive && (
                  <motion.div layoutId="mobile-active" className="absolute inset-0 bg-emerald-500/5 -z-10" />
                )}
                <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
                  <Icon className={`size-5 mb-1 transition-all duration-300 ${isActive ? 'text-emerald-500 scale-110' : 'text-zinc-600'}`} />
                  <span className={`text-[8px] font-bold uppercase tracking-widest leading-none transition-colors duration-300 ${isActive ? 'text-emerald-500' : 'text-zinc-600'}`}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {user?.is_staff && (
            <Link href="/admin" className="flex flex-col items-center justify-center min-w-[70px] h-full relative transition-all duration-300">
              {pathname === '/admin' && (
                <motion.div layoutId="mobile-active" className="absolute inset-0 bg-red-500/5 -z-10" />
              )}
              <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
                <ShieldCheck className={`size-5 mb-1 transition-all duration-300 ${pathname === '/admin' ? 'text-red-500 scale-110' : 'text-zinc-600'}`} />
                <span className={`text-[8px] font-bold uppercase tracking-widest leading-none transition-colors duration-300 ${pathname === '/admin' ? 'text-red-500' : 'text-zinc-600'}`}>
                  Admin
                </span>
              </motion.div>
            </Link>
          )}

        </div>
      </nav>
    </>
  );
};


