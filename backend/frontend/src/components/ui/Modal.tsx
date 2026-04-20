import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = 'md'
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-start justify-center pointer-events-none z-[10000] p-4 pt-8 md:pt-16">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`w-full ${widths[width]} bg-card border border-black/5 dark:border-white/5 rounded-[1.5rem] shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,1)] pointer-events-auto flex flex-col max-h-[85vh]`}
            >
              <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center shrink-0">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 italic">{title}</h2>
                <button 
                  onClick={onClose}
                  className="flex items-center justify-center p-2 -mr-2 text-zinc-400 dark:text-zinc-500 hover:text-foreground transition-all group"
                >
                  <span className="text-[9px] font-black italic tracking-widest uppercase border border-current px-1.5 py-0.5 rounded-md scale-90 group-hover:scale-100 transition-transform">ESC</span>
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 min-h-0 overscroll-contain">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
