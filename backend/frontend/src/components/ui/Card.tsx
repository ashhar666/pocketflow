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
            ? 'bg-white/80 dark:bg-black border border-black/10 dark:border-white/10 backdrop-blur-3xl shadow-sm' 
            : 'bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'}
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
  <h3 className={`font-bold tracking-tight ${className}`}>{children}</h3>
);

export const CardContent = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);
