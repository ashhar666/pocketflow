'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full flex flex-col gap-0.5">
        <label htmlFor={selectId} className="text-[10px] font-black uppercase tracking-tight text-zinc-500 group-focus-within:text-emerald-500 transition-colors italic px-1">
          {label}
        </label>
        <div className="relative group">
          <select
            id={selectId}
            ref={ref}
            className={`
              w-full rounded-xl border bg-zinc-900/80 backdrop-blur-md border-white/10 px-3 py-1.5 text-sm text-white appearance-none
              transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40
              ${error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/30' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-1 italic px-1">{error}</span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
