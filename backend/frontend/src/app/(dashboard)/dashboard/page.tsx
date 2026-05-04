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
import { Input } from '@/components/ui/Input';
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
  <div className="h-full min-h-64 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-black flex items-center justify-center">
    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
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
            <div className="relative bg-black/90 dark:bg-black border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-3 sm:gap-4 min-w-[200px] sm:min-w-[240px]">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                <ReceiptText className="size-5 sm:size-6" />
              </div>
              <div className="text-center">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 mb-1">Receipt Saved</p>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-tight text-white mb-1 truncate max-w-[160px] sm:max-w-[200px]">{autoSavedData?.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tighter">₹{autoSavedData?.amount}</p>
                <div className="mt-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-white/10 px-3 py-1 rounded-full bg-white/5">
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
          <div className="bg-white dark:bg-black p-8 rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 flex flex-col items-center gap-6">
            <div className="relative">
              <LoadingSpinner size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1">Scanning...</h3>
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

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-black/5 dark:border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight text-foreground uppercase whitespace-nowrap leading-none">
              Dashboard Summary
            </h1>
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] opacity-70 leading-none">
              Financial Overview
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-xl border border-black/5 dark:border-white/5 h-9">
            <div className="relative flex items-center h-full w-[160px]">
              <button
                onClick={() => setViewMode('monthly')}
                className={`relative z-10 flex-1 h-full text-[9px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  viewMode === 'monthly' ? 'text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`relative z-10 flex-1 h-full text-[9px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  viewMode === 'all' ? 'text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                All-Time
              </button>
              <motion.div
                layoutId="dashboardViewToggle"
                className="absolute inset-y-0 bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                initial={false}
                animate={{
                  left: viewMode === 'monthly' ? 0 : '50%',
                  width: '50%',
                }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {viewMode === 'monthly' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <div className="w-px h-4 bg-black/10 dark:white/10 mx-1" />
                  <Input
                    label=""
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase w-[120px] h-7 p-0"
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
      {/* Compact KPI Summary Row */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-3 mb-8 no-scrollbar pb-2">
        <Card className="p-3 border-black/5 dark:border-white/5 bg-background shadow-sm hover:shadow-md transition-shadow min-w-[160px] flex-1 lg:min-w-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight tabular-nums">
                {monthly ? formatCurrency(monthly.total_balance).replace('₹', '') : '---'}
              </span>
              <span className="text-[8px] text-zinc-500 font-medium">INR</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 border-black/5 dark:border-white/5 bg-background shadow-sm hover:shadow-md transition-shadow min-w-[160px] flex-1 lg:min-w-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
              {viewMode === 'monthly' ? 'Income' : 'Total In'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight tabular-nums text-indigo-600 dark:text-indigo-400">
                {monthly ? formatCurrency(viewMode === 'all' ? monthly.all_time_income : monthly.current_income_total).replace('₹', '') : '---'}
              </span>
              <span className="text-[8px] text-zinc-500 font-medium">INR</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 border-black/5 dark:border-white/5 bg-background shadow-sm hover:shadow-md transition-shadow min-w-[160px] flex-1 lg:min-w-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500">
              {viewMode === 'monthly' ? 'Expenses' : 'Total Out'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">
                {monthly ? formatCurrency(viewMode === 'all' ? monthly.all_time_expenses : monthly.current_month_total).replace('₹', '') : '---'}
              </span>
              <span className="text-[8px] text-zinc-500 font-medium">INR</span>
            </div>
          </div>
        </Card>

        <Card className="p-3 border-black/5 dark:border-white/5 bg-background shadow-sm hover:shadow-md transition-shadow min-w-[160px] flex-1 lg:min-w-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500">Savings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight tabular-nums text-blue-600 dark:text-blue-400">
                {monthly ? formatCurrency(monthly.total_savings).replace('₹', '') : '---'}
              </span>
              <span className="text-[8px] text-zinc-500 font-medium">INR</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cashflow Trend (Area Chart) */}
        <Card glass className="relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Income vs Spending</h3>
          </div>
          <div className="h-72">
            {trend && trend.length > 0 && trend.some(t => t.income > 0 || t.expense > 0) ? (
              <CashflowTrendChart data={trend} theme={theme} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-20">No Data</div>
              </div>
            )}
          </div>
        </Card>

        <Card glass>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">
            {viewMode === 'all' ? 'All-Time Spending' : 'Monthly Spending'}
          </h3>
          {monthly?.by_category && monthly.by_category.length > 0 ? (
            <div className="h-72">
              <CategoryPieChart data={monthly.by_category} theme={theme} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-zinc-700 font-bold uppercase tracking-widest text-[9px]">
              No transactions found
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Breakdown */}
        <Card glass className="lg:col-span-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">Daily Activity</h3>
          <div className="h-64">
            {weekly && weekly.length > 0 && weekly.some(d => d.expense > 0 || d.income > 0) ? (
              <WeeklyBreakdownChart data={weekly} theme={theme} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-20">No activity yet</div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card glass className="lg:col-span-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Latest Changes</h3>
            <Link href="/expenses">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-zinc-500/5 dark:bg-black hover:bg-zinc-500/10 dark:hover:bg-zinc-900 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl scale-90 group-hover:scale-100 transition-transform ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                      {item.type === 'income' ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                    </div>
                    <div>
                       <p className="font-bold text-[10px] text-foreground uppercase tracking-tight truncate max-w-[120px]">{item.title}</p>
                       <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                   <span className={`font-bold text-[10px] tracking-tight ${item.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                     {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount).replace('₹', '')} <span className="text-[8px] text-zinc-500">INR</span>
                   </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-700 flex flex-col items-center">
                 <p className="text-[9px] font-bold uppercase tracking-widest opacity-20">No history yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
