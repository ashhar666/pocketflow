'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Users, 
  Receipt, 
  TrendingUp, 
  ArrowUpRight, 
  MessageSquare,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Stats {
  total_users: number;
  total_expenses: number;
  total_income: number;
  total_expense_amount: number;
  total_income_amount: number;
  registration_trend: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/summary/admin-stats/');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-none" />)}
    </div>
    <div className="h-96 bg-white/5 rounded-none" />
  </div>;

  if (!stats) return <div>Error loading stats</div>;

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, trend: '+12%', color: 'text-blue-500' },
    { label: 'Total Expenses', value: stats.total_expenses, icon: Receipt, trend: '+5%', color: 'text-red-500' },
    { label: 'Income Tracked', value: stats.total_income, icon: TrendingUp, trend: '+8%', color: 'text-green-500' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-[#000000] border border-white/10 p-6 flex flex-col justify-between hover:border-white/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 group-hover:bg-white/10 transition-colors">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase text-green-500 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{card.label}</p>
              <h3 className="text-3xl font-black mt-1">{card.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#000000] border border-white/10 p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                User Registration Trend
              </h3>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.registration_trend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={10} 
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px', fontWeight: '900' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#000000] border border-white/10 p-8 flex flex-col justify-center">
            <h3 className="text-sm font-black uppercase tracking-tighter mb-10 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white" />
                Global Volume
            </h3>
            <div className="space-y-8">
                <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Total Managed Expenses</p>
                    <p className="text-4xl font-black text-white">₹{stats.total_expense_amount.toLocaleString()}</p>
                    <div className="w-full bg-white/5 h-1 mt-4">
                        <div className="bg-white h-full" style={{ width: '65%' }}></div>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Total Tracked Income</p>
                    <p className="text-4xl font-black text-white">₹{stats.total_income_amount.toLocaleString()}</p>
                    <div className="w-full bg-white/5 h-1 mt-4">
                        <div className="bg-white h-full" style={{ width: '80%' }}></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
