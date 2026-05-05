'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    preferred_currency: 'INR'
  });

  useEffect(() => {
    if (user) {
      setData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        preferred_currency: user.preferred_currency || 'INR'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile/', data);
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden group border-white/10 dark:bg-black transition-all duration-500">
      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-black italic text-xs">
          ...
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Profile Settings</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Personal Information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="First Name"
            value={data.first_name}
            onChange={e => setData({ ...data, first_name: e.target.value })}
            placeholder="e.g. Satoshi"
          />
          <Input
            label="Last Name"
            value={data.last_name}
            onChange={e => setData({ ...data, last_name: e.target.value })}
            placeholder="e.g. Nakamoto"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Email Address"
            type="email"
            value={data.email}
            disabled
            className="opacity-40 cursor-not-allowed bg-black/5 dark:bg-zinc-900/20"
            placeholder="your@email.com"
          />
          <Input
            label="Username"
            value={data.username}
            onChange={e => setData({ ...data, username: e.target.value })}
            placeholder="username"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Select
            label="Preferred Currency"
            value={data.preferred_currency}
            onChange={e => setData({ ...data, preferred_currency: e.target.value })}
            options={[
              { value: 'INR', label: 'Indian Rupee (INR)' },
              { value: 'USD', label: 'US Dollar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
              { value: 'GBP', label: 'British Pound (GBP)' },
              { value: 'JPY', label: 'Japanese Yen (JPY)' },
              { value: 'CAD', label: 'Canadian Dollar (CAD)' },
              { value: 'AUD', label: 'Australian Dollar (AUD)' },
            ]}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="emerald" size="lg" type="submit" isLoading={loading}>
            Update Profile
          </Button>
        </div>
      </form>
    </Card>
  );
}
