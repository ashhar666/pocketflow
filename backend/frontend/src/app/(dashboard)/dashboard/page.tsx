'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatScanFailure } from '@/lib/scanError';
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
  AlertCircle
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface MonthlySummary {
  current_month_total: number;
  previous_month_total: number;
  percentage_change: number;
  current_income_total: number;
  income_percentage_change: number;
  all_time_income: number;
  all_time_expenses: number;
  total_savings: number;
  total_balance: number;
  by_category: { name: string; amount: number; color: string }[];
  income_by_category?: { name: string; amount: number; color: string }[];
}

const ChartSkeleton = ({ label = 'Loading chart' }: { label?: string }) => (
  <div className="h-full min-h-64 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70 flex items-center justify-center">
    <span className="text-[10px] font-black uppercase italic tracking-widest text-zinc-400">{label}</span>
  </div>
);

const CashflowTrendChart = dynamic(
  () => import('./DashboardCharts').then((mod) => mod.CashflowTrendChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const CategoryPieChart = dynamic(
  () => import('./DashboardCharts').then((mod) => mod.CategoryPieChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const WeeklyBreakdownChart = dynamic(
  () => import('./DashboardCharts').then((mod) => mod.WeeklyBreakdownChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

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
  const [viewMode, setViewMode] = useState<'monthly' | 'all'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
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
    let isMounted = true;

    const recordFailure = (url: string) => {
      if (!isMounted) return;
      setFailedEndpoints((prev) => (prev.includes(url) ? prev : [...prev, url]));
      setDismissedError(false);
    };

    const safeGet = async (url: string) => {
      try {
        return await api.get(url);
      } catch (e: any) {
        console.error(`Error fetching ${url}:`, e?.response?.data || e.message);
        recordFailure(url);
        return { data: null };
      }
    };

    const fetchDashboardData = async () => {
      try {
        setFailedEndpoints([]);
        setDismissedError(false);
        setLoading(true);

        let summaryUrl = `/summary/monthly/?t=${Date.now()}`;
        if (viewMode === 'monthly') {
          const [year, month] = selectedMonth.split('-');
          const startDate = `${selectedMonth}-01`;
          const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
          const endDate = `${selectedMonth}-${lastDay}`;
          summaryUrl += `&start_date=${startDate}&end_date=${endDate}`;
        } else {
          summaryUrl += `&mode=all`;
        }

        const monthRes = await safeGet(summaryUrl);
        if (!isMounted) return;

        if (monthRes.data) setMonthly(monthRes.data);
        setLoading(false);

        const [weekRes, trendRes, insightsRes, activityRes] = await Promise.all([
          safeGet('/summary/weekly/'),
          safeGet('/summary/trend/'),
          safeGet('/summary/insights/'),
          safeGet('/summary/activity/')
        ]);

        if (!isMounted) return;
        if (weekRes.data) setWeekly(weekRes.data);
        if (trendRes.data && Array.isArray(trendRes.data)) setTrend(trendRes.data);
        if (insightsRes.data) setInsights(insightsRes.data);
        if (activityRes.data) setRecentActivity(activityRes.data);

      } catch (error) {
        console.error("Failed to process dashboard data", error);
        recordFailure('general');
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    const secondaryTimer = window.setTimeout(() => {
      // Action-only data can load after the first dashboard paint.
      api.get('/categories/')
        .then(res => {
          if (isMounted) setCategories(res.data);
        })
        .catch(err => console.error("Failed to fetch categories", err));

      api.get('/telegram/status/')
        .then(res => {
          if (isMounted) setIsTelegramConnected(res.data.connected);
        })
        .catch(() => {
          if (isMounted) setIsTelegramConnected(false);
        });
    }, 800);

    return () => {
      isMounted = false;
      window.clearTimeout(secondaryTimer);
    };
  }, [viewMode, selectedMonth]);

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
      console.error('Scan Error Details:', error.response?.data || error);
      const errorMessage = formatScanFailure(error);
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

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-8 border-b border-black/5 dark:border-white/5">
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase">
              Dashboard Summary
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">
              Overview of your money
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* View Toggle */}
            <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10 flex items-center relative h-10 overflow-hidden">
              <button
                onClick={() => setViewMode('monthly')}
                className={`relative z-10 px-4 h-full text-[10px] font-black uppercase tracking-widest italic transition-colors duration-200 ${
                  viewMode === 'monthly' ? 'text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`relative z-10 px-4 h-full text-[10px] font-black uppercase tracking-widest italic transition-colors duration-200 ${
                  viewMode === 'all' ? 'text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                All-Time
              </button>
              <motion.div
                layoutId="dashboardViewToggle"
                className="absolute inset-y-1 bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                initial={false}
                animate={{
                  left: viewMode === 'monthly' ? 4 : 76,
                  width: viewMode === 'monthly' ? 70 : 76,
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'monthly' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[10px] font-black uppercase italic w-[140px] h-10"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tighter italic">
                {monthly ? formatCurrency(monthly.total_balance).replace('₹', '') : '---'}
                <span className="text-xs ml-2 text-zinc-500 font-bold not-italic">INR</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase italic">Available Funds</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full opacity-30" />
        </Card>

        {/* Money In */}
        <Card glass className="relative overflow-hidden group border-indigo-500/20 bg-indigo-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="size-12 -rotate-12" />
          </div>
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-500 italic">
              {viewMode === 'monthly' ? 'Month In' : 'Total In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tighter italic">
                {monthly ? formatCurrency(viewMode === 'all' ? monthly.all_time_income : monthly.current_income_total).replace('₹', '') : '---'}
                <span className="text-xs ml-2 text-zinc-500 font-bold not-italic">INR</span>
              </div>
              <div className="flex items-center gap-1.5">
                {viewMode === 'monthly' && monthly && monthly.income_percentage_change !== 0 && (
                  <>
                    {monthly.income_percentage_change > 0 ? (
                      <ArrowUpRight className="size-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="size-3 text-red-500" />
                    )}
                    <span className={`text-[10px] font-black italic ${monthly.income_percentage_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {Math.abs(monthly.income_percentage_change).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-[10px] text-zinc-500 font-bold uppercase italic">
                  {viewMode === 'monthly' ? 'vs last month' : 'All time revenue'}
                </span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-full opacity-30" />
        </Card>

        {/* Money Out */}
        <Card glass className="relative overflow-hidden group border-orange-500/20 bg-orange-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="size-12 rotate-6" />
          </div>
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-orange-500 italic">
              {viewMode === 'monthly' ? 'Month Out' : 'Total Out'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tighter italic">
                {monthly ? formatCurrency(viewMode === 'all' ? monthly.all_time_expenses : monthly.current_month_total).replace('₹', '') : '---'}
                <span className="text-xs ml-2 text-zinc-500 font-bold not-italic">INR</span>
              </div>
              <div className="flex items-center gap-1.5">
                {viewMode === 'monthly' && monthly && monthly.percentage_change !== 0 && (
                  <>
                    {monthly.percentage_change < 0 ? (
                      <ArrowDownRight className="size-3 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="size-3 text-red-500" />
                    )}
                    <span className={`text-[10px] font-black italic ${monthly.percentage_change < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {Math.abs(monthly.percentage_change).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-[10px] text-zinc-500 font-bold uppercase italic">
                  {viewMode === 'monthly' ? 'vs last month' : 'All time spending'}
                </span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-orange-500 w-full opacity-30" />
        </Card>

        {/* Savings */}
        <Card glass className="relative overflow-hidden group border-blue-500/20 bg-blue-500/[0.02]">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="size-12 -rotate-6" />
          </div>
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl font-black tracking-tighter italic">
                {monthly ? formatCurrency(monthly.total_savings).replace('₹', '') : '---'}
                <span className="text-xs ml-2 text-zinc-500 font-bold not-italic">INR</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase italic">Financial Cushion</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full opacity-30" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cashflow Trend (Area Chart) */}
        <Card glass className="relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400">Income vs Spending</h3>
          </div>
          <div className="h-72">
            {trend && trend.length > 0 && trend.some(t => t.income > 0 || t.expense > 0) ? (
              <CashflowTrendChart data={trend} theme={theme} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <div className="text-xs font-black uppercase italic tracking-widest opacity-20">No Data</div>
              </div>
            )}
          </div>
        </Card>

        <Card glass>
          <h3 className="text-sm font-black uppercase italic tracking-widest text-zinc-400 mb-8">
            {viewMode === 'all' ? 'All-Time Spending' : 'Monthly Spending'}
          </h3>
          {monthly?.by_category && monthly.by_category.length > 0 ? (
            <div className="h-72">
              <CategoryPieChart data={monthly.by_category} theme={theme} />
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
              <WeeklyBreakdownChart data={weekly} theme={theme} />
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
