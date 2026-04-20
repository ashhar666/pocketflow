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
import toast from 'react-hot-toast';
import Link from 'next/link';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Scan, 
  Send, 
  RefreshCw, 
  FileDown, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ReceiptText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

const formatCurrency = (val: number | string | undefined | null) => {
  const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(num));
};

export default function DashboardPage() {
  const [monthly, setMonthly] = useState<MonthlySummary | null>(null);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedEndpoints, setFailedEndpoints] = useState<string[]>([]);
  const [dismissedError, setDismissedError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [autoSavedData, setAutoSavedData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/summary/export/', {
        responseType: 'blob'
      });

      // Create a blob from the PDF Stream
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `dashboard_report_${date}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const failures: string[] = [];
      try {
        const safeGet = async (url: string) => {
          try {
            const r = await api.get(url);
            return r;
          } catch (e: any) {
            console.error(`Error fetching ${url}:`, e?.response?.data || e.message);
            failures.push(url);
            return { data: null };
          }
        };

        const [monthRes, weekRes, trendRes, insightsRes, activityRes] = await Promise.all([
          safeGet('/summary/monthly/'),
          safeGet('/summary/weekly/'),
          safeGet('/summary/trend/'),
          safeGet('/summary/insights/'),
          safeGet('/summary/activity/')
        ]);

        if (monthRes.data) setMonthly(monthRes.data);
        if (weekRes.data) setWeekly(weekRes.data);
        if (trendRes.data && Array.isArray(trendRes.data)) setTrend(trendRes.data);
        if (insightsRes.data) setInsights(insightsRes.data);
        if (activityRes.data) setRecentActivity(activityRes.data);

      } catch (error) {
        console.error("Failed to process dashboard data", error);
        failures.push('general');
      } finally {
        setFailedEndpoints(failures);
        setDismissedError(false);
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Fetch categories for AI mapping
    api.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to fetch categories", err));

    // Check telegram status
    api.get('/telegram/status/')
      .then(res => setIsTelegramConnected(res.data.connected))
      .catch(() => setIsTelegramConnected(false));
  }, []);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/expenses/scan_receipt/', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;
      if (data.error) throw new Error(data.error);

      const isIncome = data.type?.toUpperCase() === 'INCOME';
      
      if (isIncome) {
        // Save to Income model
        const newIncome = {
          source: data.title || 'Untitled Income',
          amount: data.amount || '0.00',
          date: data.date || new Date().toISOString().split('T')[0],
          description: `AI_DASH_SCAN: ${data.category_suggestion || 'INCOME'}`,
        };
        await api.post('/income/', newIncome);
        setAutoSavedData({
          ...newIncome,
          title: newIncome.source,
          category_name: data.category_suggestion || 'Income'
        });
      } else {
        // Find best category match
        const matchedCategory = categories.find(c =>
          c.name.toLowerCase() === data.category_suggestion?.toLowerCase() ||
          data.title?.toLowerCase().includes(c.name.toLowerCase())
        );
        const categoryId = matchedCategory?.id?.toString() || (categories.length > 0 ? categories[0].id.toString() : '');

        const newExpense = {
          title: data.title || 'Untitled Receipt',
          amount: data.amount || '0.00',
          category_id: categoryId,
          date: data.date || new Date().toISOString().split('T')[0],
          notes: `AI_DASH_SCAN: ${data.category_suggestion || 'UNCATEGORIZED'}`,
        };

        // Auto-Save
        await api.post('/expenses/', newExpense);
        
        setAutoSavedData({
          ...newExpense,
          category_name: matchedCategory?.name || 'Default'
        });
      }
      
      setIsAutoSaved(true);
      
      // Refresh relevant dashboard data
      const monthRes = await api.get('/summary/monthly/');
      setMonthly(monthRes.data);
      
      toast.success('Receipt scanned & saved!');

      setTimeout(() => {
        setIsAutoSaved(false);
        setAutoSavedData(null);
      }, 3000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Extraction failed";
      toast.error(`Scan Failure: ${errorMessage}`);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSyncBot = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post('/telegram/sync/');
      toast.success(res.data.message || 'Bot link updated!');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Sync failed';
      toast.error(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">
      {/* Auto-Save Success Card */}
      {isAutoSaved && autoSavedData && (
        <div key="auto-save-card" className="fixed top-20 right-4 sm:top-24 sm:right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-500 max-w-[calc(100vw-2rem)] sm:max-w-xs">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black/90 dark:bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-3 sm:gap-4 min-w-[200px] sm:min-w-[240px]">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                <ReceiptText className="size-5 sm:size-6" />
              </div>
              <div className="text-center">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 italic mb-1">Receipt Saved</p>
                <p className="text-xs sm:text-sm font-black uppercase italic tracking-tight text-white mb-1 truncate max-w-[160px] sm:max-w-[200px]">{autoSavedData?.title}</p>
                <p className="text-xl sm:text-2xl font-black text-white italic tracking-tighter">₹{autoSavedData?.amount}</p>
                <div className="mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic text-zinc-400 border border-white/10 px-3 py-1 rounded-full bg-white/5">
                  {autoSavedData?.category_name}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-black/5 dark:border-white/5 flex flex-col items-center gap-6">
            <div className="relative">
              <LoadingSpinner size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1 italic">Scanning...</h3>
              <p className="text-sm text-zinc-500 font-medium">Extracting financial data from your receipt</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {failedEndpoints.length > 0 && !dismissedError && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <AlertCircle className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold">Some dashboard data failed to load.</p>
              <p className="text-[10px] font-mono opacity-70">{failedEndpoints.join(', ')}</p>
            </div>
          </div>
          <button
            onClick={() => setDismissedError(true)}
            className="text-xs font-black uppercase tracking-widest hover:text-red-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-black/5 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
            Dashboard Summary
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">
            Overview of your money
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-start sm:justify-end w-full sm:w-auto">
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            ref={fileInputRef}
            onChange={handleScanReceipt}
          />
          <Button 
            variant="glass" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="border-emerald-500/20 hover:border-emerald-500/40"
            leftIcon={<Scan className="size-3.5" />}
          >
            {isScanning ? 'Scanning...' : 'Scan Receipt'}
          </Button>
          <Link href={isTelegramConnected ? "https://t.me/AshharExpenseBot" : "/telegram"}>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-[#2196f3]/20 hover:border-[#2196f3]/40 text-[#2196f3]"
              leftIcon={<Send className="size-3.5" />}
            >
              {isTelegramConnected ? 'Bot' : 'Connect'}
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncBot}
            disabled={isSyncing}
            className="border-indigo-500/20 hover:border-indigo-500/40 text-indigo-500"
            title="Update Bot link (if it stops responding)"
            leftIcon={<RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            {isSyncing ? 'Syncing...' : 'Sync Bot'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            disabled={downloading}
            leftIcon={<FileDown className="size-3.5" />}
          >
            {downloading ? 'Downloading...' : 'Export PDF'}
          </Button>
          <Link href="/expenses">
            <Button variant="primary" size="sm" leftIcon={<Plus className="size-3.5" />}>Add Entry</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Wallet / Balance */}
        <Card glass className="relative overflow-hidden group border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="size-12 rotate-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1 pt-6">My Balance</p>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter pb-6">
            {formatCurrency(monthly?.total_balance || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
        </Card>

        {/* Income */}
        <Card glass className="relative overflow-hidden group border-indigo-500/20 bg-indigo-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="size-12 -rotate-12" />
          </div>
          <div className="flex justify-between items-start mb-4 pt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1">Money In (Month)</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase italic">
              <ArrowUpRight className="size-3" /> {((monthly?.income_percentage_change || 0)).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter pb-6">
            {formatCurrency(monthly?.current_income_total || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
        </Card>

        {/* Expense */}
        <Card glass className="relative overflow-hidden group border-zinc-500/20 bg-zinc-500/[0.02] transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="size-12 rotate-12" />
          </div>
          <div className="flex justify-between items-start mb-4 pt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1">Money Out (Month)</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase italic">
              <ArrowDownRight className="size-3" /> {((monthly?.percentage_change || 0)).toFixed(1)}%
            </div>
          </div>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter pb-6">
            {formatCurrency(monthly?.current_month_total || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/50 to-transparent" />
        </Card>

        {/* Savings */}
        <Card glass className="relative overflow-hidden group border-amber-500/20 bg-amber-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="size-12 -rotate-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic mb-1 pt-6">Saved Money</p>
          <h3 className="text-3xl font-black text-foreground italic tracking-tighter pb-6">
            {formatCurrency(monthly?.total_savings || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-500 font-bold not-italic">INR</span>
          </h3>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cashflow Trend (Area Chart) */}
        <Card glass className="relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400">Income vs Spending</h3>
          </div>
          <div className="h-72">
            {trend && trend.length > 0 && trend.some(t => t.amount > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
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
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), String(name).toUpperCase()]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', fontStyle: 'italic' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Spending" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <div className="text-xs font-black uppercase italic tracking-widest opacity-20">No Data</div>
              </div>
            )}
          </div>
        </Card>

        {/* Expenses by Category (Pie Chart) */}
        <Card glass>
          <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400 mb-8">Where your money goes</h3>
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
              No transactions found
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Breakdown */}
        <Card glass className="lg:col-span-2">
          <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400 mb-8">Daily Activity</h3>
          <div className="h-64">
            {weekly && weekly.length > 0 && weekly.some(d => d.expense > 0 || d.income > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#ffffff05' : '#00000005'} />
                  <XAxis dataKey="day" stroke={theme === 'dark' ? '#52525b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} className="uppercase font-black italic tracking-tighter" />
                  <YAxis stroke={theme === 'dark' ? '#52525b' : '#94a3b8'} fontSize={10} tickLine={false} axisLine={false} className="font-black italic tracking-tighter" tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#000' : '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                    formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <div className="text-xs font-black uppercase italic tracking-widest opacity-20">No activity yet</div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card glass className="lg:col-span-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400">Latest Changes</h3>
            <Link href="/expenses">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-zinc-500/5 dark:bg-white/[0.01] hover:bg-zinc-500/10 dark:hover:bg-white/[0.03] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl scale-90 group-hover:scale-100 transition-transform ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                      {item.type === 'income' ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground uppercase italic tracking-tight truncate max-w-[120px]">{item.title}</p>
                      <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-black text-xs italic tracking-tighter ${item.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount).replace('₹', '')} <span className="text-[8px] text-zinc-500 not-italic">INR</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-700 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest italic opacity-20">No history yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
