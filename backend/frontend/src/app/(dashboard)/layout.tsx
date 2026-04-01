'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-400">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-20 md:pb-0 relative">
        {/* Universal Theme Toggle / App Controls */}
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-50">
           <ThemeToggle />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
