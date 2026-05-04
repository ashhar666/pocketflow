'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`
          rounded-[32px] p-8 transition-all duration-500
          ${glass 
            ? 'bg-white/[0.01] dark:bg-zinc-950/20 border border-black/5 dark:border-white/5 backdrop-blur-3xl shadow-sm dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]' 
            : 'bg-zinc-50/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-white/[0.04]'}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`space-y-1.5 ${className}`}>{children}</div>
);

export const CardTitle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`font-black tracking-tight ${className}`}>{children}</h3>
);

export const CardContent = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);
