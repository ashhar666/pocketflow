'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import TelegramConnect from '@/components/settings/TelegramConnect';


export default function TelegramPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Telegram Bot Integration
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          Connect your account to log expenses directly via Telegram.
        </p>
      </div>

      <Card glass className="p-8">
        <TelegramConnect />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-Step Guide */}
        <Card glass className="p-8 relative overflow-hidden group">

          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 font-black italic text-[10px]">
              Step
            </div>
            <h3 className="font-black uppercase italic tracking-tighter text-foreground">Getting Started</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="text-indigo-500 font-black italic text-xl opacity-20">01</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Generate Link</p>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Click the &quot;Connect&quot; button above to create a secure, temporary connection link.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-indigo-500 font-black italic text-xl opacity-20">02</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Link Bot</p>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Open the link in Telegram and press &quot;Start&quot;. Your account will link automatically.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-indigo-500 font-black italic text-xl opacity-20">03</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Fast Entry</p>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Start sending transactions! No complex setup required after linking.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Intelligence Guide */}
        <Card glass className="p-8 relative overflow-hidden group border-emerald-500/10 hover:border-emerald-500/20 transition-all">

          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 font-black italic text-[10px]">
              Info
            </div>
            <h3 className="font-black uppercase italic tracking-tighter text-foreground">How to use</h3>
          </div>

          <div className="space-y-6">
            <div className="p-3 rounded-2xl bg-zinc-500/5 border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Quick Text</p>
              </div>
              <p className="text-[10px] font-medium text-zinc-500">
                Log items in seconds: <br/>
                <code className="text-zinc-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 mt-1 inline-block">200 Food Dinner</code>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-500/5 border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">AI Receipt Scan</p>
              </div>
              <p className="text-[10px] font-medium text-zinc-500">
                Send a photo of any receipt. The AI will detect if it&apos;s an <span className="text-emerald-500 font-bold">Income</span> or <span className="text-red-500 font-bold">Expense</span> and log it instantly.
              </p>
            </div>

            <div className="flex items-center gap-2 px-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500/60 italic">Connected</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
