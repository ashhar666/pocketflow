'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UserCog, Fingerprint, Eye, ShieldAlert, Moon, Sun, Settings as SettingsIcon, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);


  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || ''
      });
    }

    if (typeof document !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, [user]);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
    if (!isDark) {
      toast('Light mode is experimental!', { icon: '☀️' });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile/', profileData);
      toast.success('Profile updated successfully');
      // Update global context by tricking login or reloading auth
      // Since our context doesn't expose setUser directly, we might need a refresh logic.
      // For now, reload window is a cheap way, but let's just show toast.
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password/', passwordData);
      toast.success('Password changed successfully');
      setPasswordData({ old_password: '', new_password: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.old_password?.[0] || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pb-8 border-b border-black/5 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Manage your account preferences and security
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation/Sidebar */}
        <div className="lg:col-span-1 space-y-2">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic mb-4 px-4">Menu / Modules</h5>
            <button className="w-full text-left px-5 py-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-black uppercase italic tracking-wider text-xs border border-emerald-500/20 transition-all">
              Identity Profile
            </button>
             <button className="w-full text-left px-5 py-3 bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-foreground rounded-xl font-black uppercase italic tracking-wider text-xs border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all">
              Security Matrix
            </button>
            <button className="w-full text-left px-5 py-3 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground rounded-xl font-black uppercase italic tracking-wider text-xs border border-transparent transition-all">
              Interface Sync
            </button>
            <button className="w-full text-left px-5 py-3 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground rounded-xl font-black uppercase italic tracking-wider text-xs border border-transparent transition-all">
              Protocol Exports
            </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-12">
          
          <Card glass className="relative overflow-hidden group border-white/5 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <UserCog className="size-24" />
            </div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Identity Core</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Primary User Attributes</p>
              </div>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Registry / First Name" 
                  value={profileData.first_name}
                  onChange={e => setProfileData({...profileData, first_name: e.target.value})}
                />
                <Input 
                  label="Registry / Last Name" 
                  value={profileData.last_name}
                  onChange={e => setProfileData({...profileData, last_name: e.target.value})}
                />
              </div>
              <Input 
                label="System / Email Address" 
                type="email"
                value={profileData.email}
                onChange={e => setProfileData({...profileData, email: e.target.value})}
                disabled
                className="opacity-40 cursor-not-allowed bg-black/5 dark:bg-zinc-900/20"
              />
              <Input 
                label="Authentication / Username" 
                value={profileData.username}
                onChange={e => setProfileData({...profileData, username: e.target.value})}
              />
              <div className="pt-4 flex justify-end">
                <Button variant="emerald" size="lg" type="submit" isLoading={profileLoading}>Update Profile</Button>
              </div>
            </form>
          </Card>

          <Card glass className="relative overflow-hidden group border-white/5 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Fingerprint className="size-24" />
            </div>

            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="size-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-[0_0_10px_rgba(79,70,229,0.1)]">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Access Matrix</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Security Protocol Rotation</p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Current Cipher" 
                  type="password"
                  value={passwordData.old_password}
                  onChange={e => setPasswordData({...passwordData, old_password: e.target.value})}
                  required
                />
                <Input 
                  label="New Cipher Sequence" 
                  type="password"
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                  required
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="indigo" size="lg" type="submit" isLoading={passwordLoading}>Update Password</Button>
              </div>
            </form>
          </Card>

          <Card glass className="relative overflow-hidden group border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-zinc-900/10 transition-colors hover:bg-black/[0.05] dark:hover:bg-zinc-900/20 duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Eye className="size-24" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-foreground border border-black/10 dark:border-white/10 shadow-inner">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Optical Sync</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Interface Luminance Control</p>
                </div>
              </div>
              <Button variant="secondary" onClick={toggleDarkMode}>
                {isDarkMode ? 'LIGHT MODE (LEGACY)' : 'NOIR MODE (ACTIVE)'}
              </Button>
            </div>
          </Card>
          
          <Card glass className="relative overflow-hidden group border-red-500/10 bg-red-500/[0.02] transition-colors hover:bg-red-500/[0.05] duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert className="size-24" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-red-500 uppercase italic tracking-tighter">Termination</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Permanent Account Erasure</p>
                </div>
              </div>
              <Button variant="danger" size="md" onClick={() => toast.error('PROTOCOL RESTRICTED: Contact Sovereign Support.')}>
                Erasure
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
