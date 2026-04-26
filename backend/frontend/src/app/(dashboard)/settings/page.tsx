'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


// Specialized Modules
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import DangerZone from '@/components/settings/DangerZone';
import TelegramConnect from '@/components/settings/TelegramConnect';
import { Card } from '@/components/ui/Card';
import { User, Shield, Link2, Monitor, Trash2 } from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: 'Profile Settings', color: 'emerald', icon: User },
  { id: 'security', label: 'Security', color: 'indigo', icon: Shield },
  { id: 'integrations', label: 'Integrations', color: 'blue', icon: Link2 },
  { id: 'interface', label: 'Appearance', color: 'zinc', icon: Monitor },
  { id: 'danger', label: 'Delete Account', color: 'red', icon: Trash2 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Sync scroll with navigation if needed, but for this redesign 
  // we'll use a tab-like interface for a more "focused" feel.
  
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'security': return <SecuritySettings />;
      case 'integrations': return (
        <Card glass className="relative overflow-hidden group border-white/5 transition-all duration-500">
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] font-black italic text-[10px]">
              ...
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Integrations</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Connected Services</p>
            </div>
          </div>
          <TelegramConnect />
        </Card>
      );
      case 'interface': return <AppearanceSettings />;
      case 'danger': return <DangerZone />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <div className="size-4 border border-emerald-500/20 rounded flex items-center justify-center bg-emerald-500/5 font-black italic text-[8px]">Set</div>
            <span className="text-[10px] font-black uppercase tracking-widest italic">App Preferences</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
            App <span className="text-emerald-500">Settings</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium italic">
            Manage your profile, security, and appearance preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* Floating Rail Navigation */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-2">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic mb-4 px-4 flex items-center gap-2">
              Menu
            </h5>
            <div className="flex flex-col gap-2">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeTab === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`
                      group relative overflow-hidden flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300
                      ${isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.2)]' 
                        : 'bg-black/5 dark:bg-white/[0.02] text-zinc-500 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/[0.05]'}
                    `}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className={`text-xs font-black uppercase italic tracking-wider transition-all ${isActive ? 'translate-x-1' : ''}`}>
                        {section.label}
                      </span>
                    </div>

                    
                    {/* Active Background Glow */}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Content Core */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
