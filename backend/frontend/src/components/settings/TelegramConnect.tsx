'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../ui/LoadingSpinner';

type ConnectionStatus = 'loading' | 'connected' | 'disconnected';

interface LinkState {
  link: string;
  expiresAt: number; // epoch ms
}

export default function TelegramConnect() {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [linkState, setLinkState] = useState<LinkState | null>(null);
  const [generating, setGenerating] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Check connection status on mount ──────────────────────────────────────
  useEffect(() => {
    api.get('/telegram/status/')
      .then(res => setStatus(res.data.connected ? 'connected' : 'disconnected'))
      .catch(() => setStatus('disconnected'));
  }, []);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!linkState) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.round((linkState.expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setLinkState(null);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [linkState]);

  // ── Format countdown ──────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Generate link ─────────────────────────────────────────────────────────
  const handleConnect = async () => {
    setGenerating(true);
    try {
      const res = await api.get('/telegram/generate-link/');
      setLinkState({
        link: res.data.link,
        expiresAt: Date.now() + res.data.expires_in * 1000,
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || 'Failed to generate link');
    } finally {
      setGenerating(false);
    }
  };

  // ── Disconnect ────────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await api.post('/telegram/disconnect/');
      setStatus('disconnected');
      setLinkState(null);
      toast.success('Telegram disconnected');
    } catch {
      toast.error('Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3">
        <LoadingSpinner size={16} />
        <span className="text-xs font-black uppercase italic tracking-widest text-zinc-500">Checking connection…</span>
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  if (status === 'connected') {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-500 border border-white/10 shrink-0">
            <LoadingSpinner size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold uppercase tracking-tight text-foreground text-xs">
                Telegram Connected
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase tracking-widest border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              Log instantly. Try: <code className="text-zinc-300 bg-white/5 px-1 py-px rounded border border-white/5">150 Food Lunch</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="shrink-0 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {disconnecting ? 'Disconnecting…' : 'Disconnect'}
        </button>
      </div>
    );
  }

  // ── Disconnected (show connect button or link flow) ───────────────────────
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-blue-500/5 flex items-center justify-center border border-blue-500/10 shrink-0 font-bold text-[10px] text-blue-500">
          TG
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-tight text-foreground text-xs">
            Connect Telegram
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Log expenses instantly via bot message
          </p>
        </div>
      </div>

      {!linkState ? (
        /* Connect button */
        <button
          onClick={handleConnect}
          disabled={generating}
          className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 active:scale-95 transition-all w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <LoadingSpinner size={12} className="text-white" />
              Generating…
            </>
          ) : (
            <>
              Connect
            </>
          )}
        </button>
      ) : (
        /* Link flow */
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={linkState.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2196f3] text-white text-[10px] font-black uppercase italic tracking-wider hover:bg-[#1976d2] active:scale-95 transition-all w-full sm:w-auto"
          >
            Open Bot
          </a>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Expires in {formatTime(secondsLeft)}
            </div>
            
            <button
              onClick={() => {
                api.get('/telegram/status/').then(res => {
                  if (res.data.connected) {
                    setStatus('connected');
                    setLinkState(null);
                    toast.success('Telegram linked!');
                  }
                });
              }}
              className="text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


