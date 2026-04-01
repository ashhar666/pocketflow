'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import api from '@/lib/api';
import { 
  Target, TrendingDown, AlertCircle, Plus, Receipt, Activity, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Tags
} from 'lucide-react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const DynamicIcon = ({ name, className, style }: { name: string, className?: string, style?: any }) => {
  const IconComponent = (LucideIcons as any)[name] || Tags;
  return <IconComponent className={className} style={style} />;
};

interface MonthlySummary {
  current_month_total: number;
  previous_month_total: number;
  percentage_change: number;
  current_income_total: number;
  income_percentage_change: number;
  total_savings: number;
  total_balance: number;
  by_category: { name: string; amount: number; color: string }[];
}

export default function DashboardPage() {
  const [monthly, setMonthly] = useState<MonthlySummary | null>(null);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [monthRes, weekRes, trendRes, insightsRes, expensesRes] = await Promise.all([
          api.get('/summary/monthly/'),
          api.get('/summary/weekly/'),
          api.get('/summary/trend/'),
          api.get('/summary/insights/'),
          api.get('/expenses/?page_size=5')
        ]);

        setMonthly(monthRes.data);
        setWeekly(weekRes.data);
        // Trend comes in reverse chronological from backend (m, m-1,...). We want chronological for charts:
        setTrend(trendRes.data.reverse());
        setInsights(insightsRes.data);
        setRecentExpenses(expensesRes.data.results || expensesRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pb-8 border-b border-black/5 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Financial Overview
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Monitor your economic activity
          </p>
        </div>
        <Link href="/expenses">
          <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />}>Add Transaction</Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet / Balance */}
        <Card glass className="relative overflow-hidden group border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Wallet className="size-20 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1">Total Balance</p>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter">
            {formatCurrency(monthly?.total_balance || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
        </Card>

        {/* Income */}
        <Card glass className="relative overflow-hidden group border-indigo-500/20 bg-indigo-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <ArrowUpRight className="size-20 text-indigo-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase italic">
              <TrendingDown className="w-3 h-3 rotate-180" />
              {((monthly?.income_percentage_change || 0)).toFixed(1)}%
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1">Monthly Income</p>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter">
            {formatCurrency(monthly?.current_income_total || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
        </Card>

        {/* Expense */}
        <Card glass className="relative overflow-hidden group border-zinc-500/20 bg-zinc-500/[0.02] transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Activity className="size-20 text-foreground" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center text-foreground">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase italic">
              <TrendingDown className="w-3 h-3" />
              {((monthly?.percentage_change || 0)).toFixed(1)}%
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1">Monthly Expense</p>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter">
            {formatCurrency(monthly?.current_month_total || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
        </Card>

        {/* Savings */}
        <Card glass className="relative overflow-hidden group border-amber-500/20 bg-amber-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <PiggyBank className="size-20 text-amber-500" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1">Total Savings</p>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter">
            {formatCurrency(monthly?.total_savings || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trend (Area Chart) */}
        <Card glass className="relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400">Spending Trend</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#ffffff05' : '#00000005'} />
                <XAxis 
                    dataKey="month" 
                    stroke={theme === 'dark' ? '#52525b' : '#94a3b8'} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    className="uppercase font-black italic tracking-tighter"
                />
                <YAxis 
                    stroke={theme === 'dark' ? '#52525b' : '#94a3b8'} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `₹${val}`}
                    className="font-black italic tracking-tighter"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), 'VAL']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expenses by Category (Pie Chart) */}
        <Card glass>
          <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400 mb-8">Expenses by Category</h3>
          {monthly?.by_category && monthly.by_category.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthly.by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={115}
                    paddingAngle={8}
                    dataKey="amount"
                  >
                    {monthly.by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'VAL']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    className="text-[10px] font-black uppercase italic tracking-widest opacity-50"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-zinc-700 font-black uppercase italic tracking-widest text-xs">
              Zero Transaction Data Detect
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Weekly Breakdown */}
         <Card glass className="lg:col-span-2">
          <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400 mb-8">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#ffffff05' : '#00000005'} />
                <XAxis dataKey="day" stroke={theme === 'dark' ? '#52525b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} className="uppercase font-black italic tracking-tighter" />
                <YAxis stroke={theme === 'dark' ? '#52525b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} className="font-black italic tracking-tighter" />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), 'VAL']}
                />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card glass className="lg:col-span-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400">Recent Transactions</h3>
            <Link href="/expenses">
                <Button variant="ghost" size="sm">Audit All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.01] hover:bg-zinc-500/10 dark:hover:bg-white/[0.03] transition-all group">
                  <div className="flex items-center gap-4">
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110"
                      style={{ 
                        backgroundColor: `${expense.category?.color || '#a1a1aa'}15`, 
                        border: `1px solid ${expense.category?.color || '#a1a1aa'}30`,
                        color: expense.category?.color || '#a1a1aa'
                      }}
                    >
                      <DynamicIcon name={expense.category?.icon || 'Tags'} className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground uppercase italic tracking-tight truncate max-w-[120px]">{expense.title}</p>
                      <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-black text-xs text-foreground italic tracking-tighter">
                    -{formatCurrency(expense.amount).replace('₹', '')} <span className="text-[8px] text-zinc-500 not-italic">INR</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-700 flex flex-col items-center">
                <Receipt className="w-8 h-8 opacity-20 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">No Registry Entries</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
