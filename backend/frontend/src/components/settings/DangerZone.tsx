'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function DangerZone() {
  const handleErasure = () => {
    toast.error('ACTION RESTRICTED: Contact support for account deletion.', {
      duration: 4000
    });
  };

  return (
    <Card className="relative overflow-hidden group border-red-500/20 dark:bg-black transition-colors duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] font-black italic text-xs">
            ...
          </div>
          <div>
            <h2 className="text-xl font-black text-red-500 uppercase italic tracking-tighter">Delete Account</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Permanent Data Removal</p>
          </div>
        </div>
        
        <div className="w-full sm:w-auto">
          <Button 
            variant="danger" 
            size="lg" 
            onClick={handleErasure}
            className="w-full sm:w-auto shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
          >
            Delete account
          </Button>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 relative z-10">
        <p className="text-[10px] text-red-500 font-bold uppercase italic tracking-widest leading-relaxed">
          WARNING: THIS ACTION IS IRREVERSIBLE. ALL YOUR DATA, INCLUDING EXPENSES AND SETTINGS, WILL BE PERMANENTLY REMOVED.
        </p>
      </div>
    </Card>
  );
}
