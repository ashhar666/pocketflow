'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Mail, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface SupportMessage {
  id: number;
  sender_email: string;
  message: string;
  created_at: string;
  email_sent: boolean;
}

export default function AdminSupport() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get('/summary/admin-messages/');
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) return <div className="space-y-4">
    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse" />)}
  </div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tighter">Support Inbox</h2>
        <span className="bg-white text-black px-2 py-1 text-[10px] font-black uppercase">
          {messages.length} Messages
        </span>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="border border-dashed border-white/20 p-20 text-center">
            <Mail className="w-10 h-10 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase text-xs">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-[#000000] border border-white/10 p-6 hover:border-white/40 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black">{msg.sender_email || 'Anonymous User'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase">
                      <Clock className="w-3 h-3" />
                      {format(new Date(msg.created_at), 'MMM dd, yyyy · HH:mm')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {msg.email_sent ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Relayed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-1">
                      <XCircle className="w-3 h-3" />
                      Relay Failed
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white/5 p-4 border-l-2 border-white">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
