'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-16 rounded-full bg-zinc-100 dark:bg-white/[0.05] border border-black/5 dark:border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)] transition-colors duration-500 group overflow-hidden",
        className
      )}
      aria-label="Toggle theme"
    >
      {/* Background Track Text Indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        <span className={cn(
          "text-[8px] font-black italic tracking-tighter transition-all duration-500",
          theme === 'light' ? "text-amber-500 opacity-100 scale-110" : "text-zinc-500 opacity-20 scale-90"
        )}>LGT</span>
        <span className={cn(
          "text-[8px] font-black italic tracking-tighter transition-all duration-500",
          theme === 'dark' ? "text-emerald-500 opacity-100 scale-110" : "text-zinc-500 opacity-20 scale-90"
        )}>DRK</span>
      </div>

      {/* Sliding Knob */}
      <motion.div
        animate={{ 
          x: theme === 'dark' ? 32 : 4,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }}
        className="absolute top-1 size-7 rounded-full bg-white dark:bg-zinc-950 shadow-[0_2px_8px_rgba(0,0,0,0.15),0_0_1px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden z-20 border border-black/[0.02] dark:border-white/[0.05]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.div
              key="moon-knob"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] font-black italic text-emerald-500"
            >
              M
            </motion.div>
          ) : (
            <motion.div
              key="sun-knob"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] font-black italic text-amber-500"
            >
              S
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Knob Highlight */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-none" />
      </motion.div>

      {/* Polish Overlay */}
      <div className="absolute inset-0 rounded-full border border-black/5 dark:border-white/5 pointer-events-none" />
    </button>
  );
};
