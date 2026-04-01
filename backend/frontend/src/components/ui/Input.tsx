'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full flex flex-col gap-0.5">
        <label htmlFor={inputId} className="text-[10px] font-black uppercase tracking-tight text-zinc-500 group-focus-within:text-emerald-500 transition-colors italic px-1">
          {label}
        </label>
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-400 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full rounded-xl border bg-zinc-900/80 backdrop-blur-md border-white/10 px-3 py-1.5 text-sm text-white
              transition-all duration-300 placeholder:text-zinc-500
              focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40
              ${error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/30' : ''}
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-1 italic px-1">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
