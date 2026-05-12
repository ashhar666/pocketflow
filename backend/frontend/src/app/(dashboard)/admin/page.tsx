'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  Activity, 
  Database, 
  ArrowUpRight, 
  ShieldAlert,
  Server,
  Cpu,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PlatformStats {
  total_users: number;
  active_users_30d: number;
  total_transactions: number;
  total_volume: number;
}

interface UserGrowth {
  month: string;
  users: number;
}

interface RecentUser {
  email: string;
  date_joined: string;
  is_active: boolean;
  is_staff: boolean;
}

interface RecentMessage {
  sender: string;
  message: string;
  created_at: string;
}

interface AdminData {
  platform_stats: PlatformStats;
  user_growth: UserGrowth[];
  recent_users: RecentUser[];
  recent_messages: RecentMessage[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await api.get('/summary/admin-stats/');
        setData(response.data);
      } catch (error: any) {
        console.error("Admin data fetch error:", error);
        toast.error("Failed to load admin stats. Are you an administrator?");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Initializing Command Center...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="size-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
          <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold uppercase tracking-tight">Access Restricted</h1>
          <p className="text-zinc-500 text-xs font-medium max-w-xs">This sector is restricted to platform administrators. Unauthorized access is logged.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>Return to Surface</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase leading-none mb-2">Command Center</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Platform Overview & Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Systems Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Operatives" 
          value={data.platform_stats.total_users.toLocaleString()} 
          icon={<Users className="size-5" />}
          color="blue"
        />
        <StatCard 
          label="Active (30D)" 
          value={data.platform_stats.active_users_30d.toLocaleString()} 
          icon={<Activity className="size-5" />}
          color="emerald"
        />
        <StatCard 
          label="Total Intel" 
          value={data.platform_stats.total_transactions.toLocaleString()} 
          icon={<Database className="size-5" />}
          color="purple"
        />
        <StatCard 
          label="Volume Flow" 
          value={`₹${data.platform_stats.total_volume.toLocaleString()}`} 
          icon={<ArrowUpRight className="size-5" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card glass className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operative Onboarding (6M)</h3>
          </div>
          <div className="space-y-6">
            {data.user_growth.map((month, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-zinc-400">{month.month}</span>
                  <span className="text-white">{month.users} users</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(month.users / (Math.max(...data.user_growth.map(m => m.users)) || 1)) * 100}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card glass className="p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Server Infrastructure</h3>
            <div className="space-y-4">
              <InfraItem label="CPU Load" value="12%" icon={<Cpu className="size-3.5" />} />
              <InfraItem label="Memory" value="4.2GB / 16GB" icon={<Server className="size-3.5" />} />
              <InfraItem label="Network" value="Active" icon={<Globe className="size-3.5" />} />
            </div>
          </Card>
          
          <Card glass className="p-6 border-red-500/10 bg-red-500/[0.02]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-6">Security Protocols</h3>
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                Advanced encryption is active across all data layers. Zero-trust architecture enforced for all admin endpoints.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* New Sections: Users & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Operatives */}
        <Card glass className="p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Recent Operatives</h3>
            <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Live Sync Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Identifier</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Uplink Date</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recent_users.map((user, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors">{user.email}</span>
                        {user.is_staff && <span className="text-[7px] font-black uppercase tracking-widest text-red-500 mt-0.5">Admin Privileges</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-medium text-zinc-500">{user.date_joined}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`size-1 rounded-full ${user.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          {user.is_active ? 'Active' : 'Offline'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* System Transmissions */}
        <Card glass className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Transmissions</h3>
            <ShieldAlert className="size-4 text-red-500/40" />
          </div>
          <div className="flex-1 space-y-6">
            {data.recent_messages.length > 0 ? (
              data.recent_messages.map((msg, idx) => (
                <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-emerald-500/50 before:to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{msg.sender}</span>
                    <span className="text-[8px] font-medium text-zinc-600">{msg.created_at}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                    {msg.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-4 opacity-20">
                <Activity className="size-8 text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">No active transmissions</span>
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-white/5">
            <Button variant="outline" className="w-full border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.2em] h-12 hover:bg-white/[0.04]">
              View All Communications
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <Card className="p-6 border-black/5 dark:border-white/5 bg-background shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 size-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 ${color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-zinc-500'}`} />
      <div className="relative z-10 flex flex-col gap-4">
        <div className={`size-10 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function InfraItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-3">
        <div className="text-zinc-500">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      </div>
      <span className="text-[10px] font-black text-white">{value}</span>
    </div>
  );
}
