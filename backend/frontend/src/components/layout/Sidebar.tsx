'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  ReceiptText, 
  Shapes, 
  Gauge, 
  Vault, 
  Settings2,
  LogOut,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { name: 'Income', href: '/income', icon: TrendingUp },
  { name: 'Expenses', href: '/expenses', icon: ReceiptText },
  { name: 'Categories', href: '/categories', icon: Shapes },
  { name: 'Budgets', href: '/budgets', icon: Gauge },
  { name: 'Savings', href: '/savings', icon: Vault },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-background border-r border-border sticky top-0 overflow-hidden transition-colors duration-400">
        <div className="p-8">
            <Link href="/" className="flex items-center space-x-3 group/logo">
                <div className="size-8 bg-foreground rounded-lg flex items-center justify-center shadow-lg group-hover/logo:scale-110 transition-transform">
                    <Target className="size-5 text-background" />
                </div>
                <div className="flex flex-col -space-y-1">
                    <span className="font-black text-lg tracking-tighter hidden sm:block text-foreground uppercase italic leading-none">ExpenseTracker</span>
                    <div className="flex items-center gap-2">
                        <div className="size-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[7px] font-black uppercase tracking-[0.1em] text-muted-foreground italic">Systems Active</span>
                    </div>
                </div>
            </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <div className="px-4 mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">Core Systems</span>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group ${isActive ? 'text-foreground' : 'text-zinc-500 hover:text-foreground hover:bg-zinc-500/5 dark:hover:bg-white/[0.02]'}`}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`relative z-10 p-1.5 rounded-lg transition-all duration-500 ${isActive ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'group-hover:text-emerald-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm uppercase italic tracking-tight relative z-10">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.01]">
          <div className="px-4 py-3 mb-4 rounded-2xl border border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.02] flex items-center gap-3 shadow-sm">
            <div className="size-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-black/5 dark:border-white/10 flex items-center justify-center text-foreground font-black italic shadow-inner">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-foreground uppercase italic truncate tracking-tight">{user?.first_name || user?.username}</p>
              <p className="text-[10px] text-zinc-600 font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase italic tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Deactivate Session
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-4 inset-x-4 z-50 bg-background/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl safe-area-bottom px-2 overflow-hidden transition-colors duration-400">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
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
                <Icon className={`w-5 h-5 mb-1 transition-colors duration-300 ${isActive ? 'text-emerald-500' : 'text-zinc-600'}`} />
                <span className={`text-[8px] font-black uppercase tracking-widest italic ${isActive ? 'text-emerald-500' : 'text-zinc-600'}`}>
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
