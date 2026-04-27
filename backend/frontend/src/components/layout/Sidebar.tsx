'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  LogOut
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Income', href: '/income', icon: CircleArrowUp },
  { name: 'Expenses', href: '/expenses', icon: CircleArrowDown },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Savings', href: '/savings', icon: PiggyBank },
  { name: 'Telegram', href: '/telegram', icon: Send },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen bg-background border-r border-border sticky top-0 overflow-hidden transition-colors duration-400 print:hidden z-[10001]">
        <div className="pt-10 p-6 pb-4">
          <Link href="/" className="flex items-center group/logo">
            <div className="flex flex-col -space-y-0.5 ml-1">
              <span className="font-black text-base tracking-tighter text-foreground uppercase italic leading-none">PocketFlow</span>
              <div className="flex items-center gap-1.5">
                <div className="size-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[7px] font-black uppercase tracking-[0.15em] text-muted-foreground italic">App Ready</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-3">
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-700 italic">Main Menu</span>
          </div>
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
                  <span className="font-black text-xs uppercase italic tracking-widest relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.01] shrink-0">
          <div className="px-3 py-3 mb-3 rounded-xl border border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.02] flex items-center gap-3 shadow-sm">
            <div className="size-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-foreground font-black italic shadow-inner">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-foreground uppercase italic truncate tracking-tight leading-none mb-0.5">{user?.first_name || user?.username}</p>
              <p className="text-[10px] text-zinc-600 font-medium truncate opacity-70">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase italic tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="size-3.5 group-hover:rotate-12 transition-transform" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-4 inset-x-4 z-[10001] bg-background/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl safe-area-bottom px-2 overflow-hidden transition-colors duration-400">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full h-full relative transition-all duration-300">
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute inset-0 bg-emerald-500/5 -z-10"
                  />
                )}
                <Icon className={`size-5 mb-1 transition-all duration-300 ${isActive ? 'text-emerald-500 scale-110' : 'text-zinc-600'}`} />
                <span className={`text-[8px] font-black uppercase tracking-widest italic leading-none transition-colors duration-300 ${isActive ? 'text-emerald-500' : 'text-zinc-600'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};


