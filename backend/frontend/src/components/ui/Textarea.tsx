'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full flex flex-col gap-0.5">
        <label htmlFor={textareaId} className="text-[10px] font-black uppercase tracking-tight text-zinc-500 focus-within:text-emerald-500 transition-colors italic px-1">
          {label}
        </label>
        <div className="relative group">
          <textarea
            id={textareaId}
            ref={ref}
            className={`
              w-full rounded-xl border bg-zinc-900/80 backdrop-blur-md border-white/10 px-3 py-1.5 text-sm text-white min-h-[60px]
              transition-all duration-300 placeholder:text-zinc-500
              focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40
              ${error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/30' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-1 italic px-1">{error}</span>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
