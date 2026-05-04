'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.new_password !== data.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password
      });
      toast.success('Password updated successfully');
      setData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.old_password?.[0] || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden group border-white/10 dark:bg-black transition-all duration-500">
      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className="size-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-[0_0_10px_rgba(79,70,229,0.1)] font-black italic text-xs">
          ...
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Security Settings</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Password Management</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8">
          <Input
            label="Current Password"
            type="password"
            value={data.old_password}
            onChange={e => setData({ ...data, old_password: e.target.value })}
            required
            placeholder="••••••••"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="New Password"
              type="password"
              value={data.new_password}
              onChange={e => setData({ ...data, new_password: e.target.value })}
              required
              placeholder="••••••••"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={data.confirm_password}
              onChange={e => setData({ ...data, confirm_password: e.target.value })}
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="indigo" size="lg" type="submit" isLoading={loading}>
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
