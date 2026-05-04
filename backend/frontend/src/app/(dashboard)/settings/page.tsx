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
        <Card className="relative overflow-hidden group border-white/10 dark:bg-black transition-all duration-500">
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] font-black italic text-[10px]">
              ...
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Integrations</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Connected Services</p>
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
            <span className="text-[10px] font-bold uppercase tracking-widest">App Preferences</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
            Account <span className="text-emerald-500">Settings</span>
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Manage your profile, security, and appearance preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* Floating Rail Navigation */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 space-y-2">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 px-4 flex items-center gap-2">
              Configuration
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
                        : 'bg-white/[0.02] text-zinc-500 hover:text-foreground hover:bg-white/[0.05]'}
                    `}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <span className={`text-[11px] font-bold uppercase tracking-wider transition-all ${isActive ? 'translate-x-1' : ''}`}>
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
