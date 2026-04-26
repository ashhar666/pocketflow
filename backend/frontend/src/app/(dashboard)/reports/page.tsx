'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LabelList, PieChart as RePieChart, Pie
} from 'recharts';
import api from '@/lib/api';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Sparkles,
  Zap,
  LineChart,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ComparisonItem {
  category: string;
  this_month: number;
  last_month: number;
  diff: number;
  diff_percent: number;
  color: string;
}

interface ComparisonData {
  is_demo: boolean;
  total_net_diff: number;
  total_net_diff_percent: number;
  this_month_total: number;
  last_month_total: number;
  comparison: ComparisonItem[];
}

const formatCurrency = (val: number | string | undefined | null) => {
  const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(num));
};

export default function ReportsPage() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { theme } = useTheme();

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/summary/export/comparison/', {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `PocketFlow_Intelligence_Report_${date}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Intelligence report generated successfully');
    } catch (error: any) {
      console.error('Failed to download report:', error);
      toast.error('Failed to generate report');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/summary/comparison/');
        if (res.data?.comparison) {
          res.data.comparison = res.data.comparison.map((item: any) => ({
            ...item,
            this_month: parseFloat(item.this_month) || 0,
            last_month: parseFloat(item.last_month) || 0,
          }));
        }
        setData(res.data);
      } catch (err: any) {
        console.error("Comparison Data Fetch Error:", err);
        toast.error(`Failed to load comparison data`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="flex justify-center mb-4">
          <LoadingSpinner size={32} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Loading report data...</p>
      </div>
    );
  }

  const isSaving = (data?.total_net_diff || 0) <= 0;
  const thisMonthTotal = data?.this_month_total || (data?.comparison.reduce((sum, item) => sum + item.this_month, 0) || 0);
  const lastMonthTotal = data?.last_month_total || (data?.comparison.reduce((sum, item) => sum + item.last_month, 0) || 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 backdrop-blur-xl">
              <FileText className="size-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                Intelligence
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Monthly Performance Review</p>
                {data?.is_demo && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[7px] font-black uppercase tracking-widest italic">DEMO</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[9px] uppercase font-black italic tracking-widest px-4 h-9"
          >
            <Calendar className="size-3.5 mr-2" />
            Current Month
          </Button>
          <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleDownloadReport}
            isLoading={downloading}
            className="text-[9px] uppercase font-black italic tracking-widest px-6 h-9"
          >
            <Download className="size-3.5 mr-2" />
            Export Intelligence
          </Button>
        </div>
      </div>

      {/* High-Density Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glass className="p-6 col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity -rotate-12 translate-x-4 -translate-y-4">
            <TrendingUp className="size-32" />
          </div>
          <div className="flex flex-col h-full justify-between gap-6 relative z-10">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
              <Sparkles className="size-3" /> Spending Pulse
            </div>
            <div className="flex items-end gap-12">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">This Period</p>
                <p className="text-4xl font-black text-foreground italic tracking-tighter leading-none">
                  {formatCurrency(thisMonthTotal)}
                </p>
              </div>
              <div className="space-y-1 opacity-50">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest italic">Previous</p>
                <p className="text-2xl font-black text-foreground italic tracking-tighter leading-none">
                  {formatCurrency(lastMonthTotal)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card glass className="p-6 relative overflow-hidden group">
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 italic">
              <Zap className="size-3" /> Variation
            </div>
            <div>
              <p className={`text-4xl font-black italic tracking-tighter leading-none ${isSaving ? 'text-emerald-500 text-glow-emerald' : 'text-red-500 text-glow-red'}`}>
                {isSaving ? '-' : '+'}{formatCurrency(Math.abs(data?.total_net_diff || 0))}
              </p>
              <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase italic ${isSaving ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {isSaving ? <TrendingDown className="size-2.5" /> : <TrendingUp className="size-2.5" />}
                {Math.abs(data?.total_net_diff_percent || 0).toFixed(1)}% {isSaving ? 'DECREASE' : 'INCREASE'}
              </div>
            </div>
          </div>
        </Card>

        <Card glass className="p-6 relative overflow-hidden group">
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 italic">
              <BarChart3 className="size-3" /> Intensity
            </div>
            <div>
              <p className="text-4xl font-black text-foreground italic tracking-tighter leading-none uppercase">
                {data?.comparison.length || 0}
              </p>
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic mt-2">Active Categories</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Bento Grid Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Comparison Engine */}
        <Card glass className="lg:col-span-8 p-8 border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Comparative Engine</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">Performance Delta over time</p>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase italic">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-500/60" /> Last Period
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500" /> Current
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.comparison || []} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 9, fontWeight: 900 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 9, fontWeight: 900 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'K' : val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.015)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    padding: '12px'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  formatter={(value: any) => [`₹${parseFloat(value).toLocaleString()}`, '']}
                />
                <Bar 
                  dataKey="last_month" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                  barSize={18}
                  fillOpacity={0.3}
                />
                <Bar 
                  dataKey="this_month" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown List */}
        <Card glass className="lg:col-span-4 p-0 overflow-hidden border-black/5 dark:border-white/5 flex flex-col h-full">
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
            <h3 className="text-sm font-black uppercase italic tracking-tighter">Drill-Down Analysis</h3>
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Efficiency metrics per track</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[440px] scrollbar-hide">
            {(data?.comparison || []).map((row, idx) => {
              const isUp = row.diff > 0;
              return (
                <div key={idx} className="p-5 border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-1 rounded-full shrink-0" style={{ backgroundColor: row.color }}></div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black italic uppercase tracking-tight text-foreground truncate">{row.category}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest italic">
                        Ratio: {((row.this_month / thisMonthTotal) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black italic tracking-tighter text-foreground">
                      {formatCurrency(row.this_month)}
                    </p>
                    <div className={`flex items-center justify-end gap-1 text-[8px] font-black uppercase italic ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isUp ? '+' : '-'}{Math.abs(row.diff_percent).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Distribution Map */}
        <Card glass className="lg:col-span-4 p-8 border-black/5 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <PieChart className="size-32" />
          </div>
          <h3 className="text-sm font-black uppercase italic tracking-tighter mb-8">Allocation Map</h3>
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data?.comparison || []}
                  dataKey="this_month"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={75}
                  stroke="none"
                  paddingAngle={4}
                >
                  {(data?.comparison || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} fillOpacity={0.9} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '9px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    padding: '8px 12px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[7px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">TOTAL</p>
              <p className="text-lg font-black italic tracking-tighter text-foreground">
                {(thisMonthTotal/1000).toFixed(1)}K
              </p>
            </div>
          </div>
        </Card>

        {/* Detailed Comparison Matrix */}
        <Card glass className="lg:col-span-8 p-0 overflow-hidden border-black/5 dark:border-white/5 h-full">
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
            <h3 className="text-sm font-black uppercase italic tracking-tighter text-blue-500">Execution Matrix</h3>
            <p className="text-[8px] text-zinc-600 font-black uppercase italic tracking-widest">Performance audit</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 italic bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="px-8 py-4">Data Track</th>
                  <th className="px-8 py-4 text-right">Last Period</th>
                  <th className="px-8 py-4 text-right">Current Execution</th>
                  <th className="px-8 py-4 text-right">Delta State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {data?.comparison.map((row, idx) => {
                  const isUp = row.diff > 0;
                  return (
                    <tr key={idx} className="group hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-1.5 rounded-full ring-2 ring-offset-2 ring-offset-transparent ring-black/5 dark:ring-white/5 group-hover:scale-125 transition-transform" style={{ backgroundColor: row.color }}></div>
                          <span className="text-[11px] font-black italic uppercase tracking-tight text-foreground">{row.category}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black italic tracking-tighter text-zinc-500 text-[10px] opacity-40">
                        {Math.round(row.last_month).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[11px] font-black italic tracking-tighter text-foreground bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">
                          {Math.round(row.this_month).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase italic ${isUp ? 'bg-red-500/10 text-red-500 border border-red-500/20' : row.diff === 0 ? 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                          {isUp ? <ArrowUpRight className="size-3" /> : row.diff === 0 ? '--' : <ArrowDownRight className="size-3" />}
                          {Math.abs(row.diff_percent).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
