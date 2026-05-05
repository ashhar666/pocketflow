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
import { useAuth } from '@/context/AuthContext';
import { formatCurrency as globalFormatCurrency } from '@/lib/utils';

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


export default function ReportsPage() {
  const { user } = useAuth();
  const preferredCurrency = user?.preferred_currency || 'INR';
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { theme } = useTheme();

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/summary/comparison-report/', {
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
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Loading report data...</p>
      </div>
    );
  }

  const isSaving = (data?.total_net_diff || 0) <= 0;
  const thisMonthTotal = data?.this_month_total || (data?.comparison.reduce((sum, item) => sum + item.this_month, 0) || 0);
  const lastMonthTotal = data?.last_month_total || (data?.comparison.reduce((sum, item) => sum + item.last_month, 0) || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Reports & Insights</h1>
          <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">Comparative analysis of your spending habits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            leftIcon={<Calendar className="size-4" />}
          >
            Current Month
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadReport}
            isLoading={downloading}
            className="h-9 px-4"
            leftIcon={<Download className="size-4" />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* High-Density Metric Row */}
      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <LineChart className="size-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">This Month</p>
              <h3 className="text-xl font-bold tracking-tight tabular-nums">
               {globalFormatCurrency(thisMonthTotal, preferredCurrency)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-zinc-500/10 rounded-xl">
              <Calendar className="size-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Previous</p>
              <h3 className="text-xl font-bold tracking-tight tabular-nums">
                {globalFormatCurrency(lastMonthTotal, preferredCurrency)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${isSaving ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
              {isSaving ? <TrendingDown className={`size-5 text-emerald-600`} /> : <TrendingUp className={`size-5 text-rose-600`} />}
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Variation</p>
              <h3 className={`text-xl font-bold tracking-tight tabular-nums ${isSaving ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Math.abs(data?.total_net_diff_percent || 0).toFixed(1)}%
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <BarChart3 className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Categories</p>
              <h3 className="text-xl font-bold tracking-tight tabular-nums">
                {data?.comparison.length || 0}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Bento Grid Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Comparison Engine */}
        <Card className="lg:col-span-8 p-6 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold tracking-tight">Spending Comparison</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">This month vs Last month</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-500/30" /> Last Period
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-600" /> Current
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
                  tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }}
                  tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(0) + 'K' : val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.015)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    padding: '12px'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  formatter={(value: any) => [globalFormatCurrency(value, preferredCurrency), '']}
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
        <Card className="lg:col-span-4 p-0 overflow-hidden border-black/5 dark:border-white/10 dark:bg-black shadow-sm flex flex-col h-full">
          <div className="p-5 border-b dark:border-white/10 dark:bg-black">
            <h3 className="text-sm font-semibold tracking-tight">Category Breakdown</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Monthly allocation</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[440px] scrollbar-hide">
            {(data?.comparison || []).map((row, idx) => {
              const isUp = row.diff > 0;
              return (
                <div key={idx} className="p-5 border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-1 rounded-full shrink-0" style={{ backgroundColor: row.color }}></div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-tight text-foreground truncate">{row.category}</p>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                        Ratio: {((row.this_month / thisMonthTotal) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold tracking-tighter text-foreground">
                      {globalFormatCurrency(row.this_month, preferredCurrency)}
                    </p>
                    <div className={`flex items-center justify-end gap-1 text-[8px] font-bold uppercase ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isUp ? '+' : '-'}{Math.abs(row.diff_percent).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Distribution Map */}
        <Card className="lg:col-span-4 p-8 border-black/5 dark:border-white/10 dark:bg-black relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <PieChart className="size-32" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Allocation Map</h3>
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
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '8px 12px'
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.3em] mb-1">TOTAL</p>
              <p className="text-lg font-bold tracking-tighter text-foreground">
                {(thisMonthTotal/1000).toFixed(1)}K
              </p>
            </div>
          </div>
        </Card>

        {/* Detailed Comparison Matrix */}
        <Card className="lg:col-span-8 p-0 overflow-hidden border-black/5 dark:border-white/10 dark:bg-black shadow-sm h-full">
          <div className="p-5 border-b dark:border-white/10 dark:bg-black flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">Execution Matrix</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Performance Audit</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="dark:bg-black text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 border-b dark:border-white/10">
                  <th className="px-8 py-3">Category</th>
                  <th className="px-8 py-3 text-right">Last Period</th>
                  <th className="px-8 py-3 text-right">Current</th>
                  <th className="px-8 py-3 text-right">Variation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {data?.comparison.map((row, idx) => {
                  const isUp = row.diff > 0;
                  return (
                    <tr key={idx} className="group hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-1.5 rounded-full" style={{ backgroundColor: row.color }}></div>
                          <span className="text-[11px] font-semibold uppercase tracking-tight text-foreground">{row.category}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-medium tracking-tighter text-muted-foreground/50 text-[10px]">
                        {Math.round(row.last_month).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[11px] font-bold tracking-tighter text-foreground bg-muted/50 px-2 py-1 rounded-lg">
                          {Math.round(row.this_month).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-bold uppercase ${isUp ? 'bg-red-500/10 text-red-500' : row.diff === 0 ? 'bg-zinc-500/10 text-zinc-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
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
