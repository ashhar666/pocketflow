"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'outline' | 'emerald' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
    
    const variants = {
      primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] border-none relative overflow-hidden",
      secondary: "bg-black/5 dark:bg-black text-foreground dark:text-white border border-black/10 dark:border-white/20 hover:bg-black/10 dark:hover:bg-zinc-900 transition-colors",
      emerald: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      indigo: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]",
      danger: "bg-red-600/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all",
      ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-white",
      glass: "bg-black/[0.02] dark:bg-black hover:bg-black/[0.04] dark:hover:bg-zinc-900 border border-black/5 dark:border-white/10 text-foreground dark:text-white shadow-xl hover:shadow-2xl transition-shadow",
      outline: "bg-transparent border border-black/10 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
    };

    const sizes = {
      sm: "px-4 py-2 text-[10px] uppercase tracking-widest font-bold gap-2",
      md: "px-6 py-3 text-xs uppercase tracking-widest font-bold gap-2.5",
      lg: "px-8 py-4 text-sm uppercase tracking-widest font-bold gap-3"
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner className="text-current" size={12} />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
