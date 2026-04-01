"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'outline' | 'emerald' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] border-none",
      secondary: "bg-white/[0.05] text-white border border-white/10 hover:bg-white/[0.1] backdrop-blur-md",
      emerald: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      indigo: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]",
      danger: "bg-red-600/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all",
      ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white",
      glass: "bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-3xl border border-white/5 text-white shadow-xl",
      outline: "bg-transparent border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5"
    };

    const sizes = {
      sm: "px-4 py-2 text-xs uppercase tracking-widest font-black italic",
      md: "px-6 py-3 text-sm uppercase tracking-widest font-black italic",
      lg: "px-8 py-4 text-base uppercase tracking-widest font-black italic"
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children as React.ReactNode}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
