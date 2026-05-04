import React from 'react';

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
  color?: 'emerald' | 'amber' | 'rose' | 'blue' | 'zinc';
}

const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max, 
  className = "", 
  color = 'emerald' 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    amber: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    rose: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    blue: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    zinc: 'bg-zinc-500 shadow-[0_0_10px_rgba(113,113,122,0.3)]'
  };

  return (
    <div className={`w-full h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full transition-all duration-1000 ease-out rounded-full ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default Progress;
