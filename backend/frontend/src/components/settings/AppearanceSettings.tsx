'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function AppearanceSettings() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
    if (!isDark) {
      toast('Light mode activated - Experimental');
    } else {
      toast.success('Dark mode activated');
    }
  };

  return (
    <Card className="relative overflow-hidden group border-white/10 dark:bg-black transition-all duration-500">
      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="size-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-foreground border border-black/10 dark:border-white/10 shadow-inner font-black italic text-xs">
          ...
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Appearance</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Theme Preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div 
          onClick={() => !isDarkMode && toggleDarkMode()}
          className={`cursor-pointer group/theme relative overflow-hidden rounded-2xl border-2 transition-all p-6 ${isDarkMode ? 'border-emerald-500 bg-emerald-500/5' : 'border-black/5 bg-black/5 hover:border-black/10'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded-lg font-black text-[10px] ${isDarkMode ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                ...
              </div>
              <span className="text-sm font-black uppercase tracking-wider italic">Dark Mode</span>
            </div>
            {isDarkMode && <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-zinc-800 rounded-full" />
            <div className="h-2 w-2/3 bg-zinc-800 rounded-full" />
          </div>
        </div>

        <div 
          onClick={() => isDarkMode && toggleDarkMode()}
          className={`cursor-pointer group/theme relative overflow-hidden rounded-2xl border-2 transition-all p-6 ${!isDarkMode ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded-lg font-black text-[10px] ${!isDarkMode ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                ...
              </div>
              <span className="text-sm font-black uppercase tracking-wider italic">Light Mode</span>
            </div>
            {!isDarkMode && <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />}
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-zinc-200 rounded-full" />
            <div className="h-2 w-2/3 bg-zinc-200 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}
