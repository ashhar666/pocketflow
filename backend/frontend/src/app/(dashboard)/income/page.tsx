'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Wallet,
  Download,
  Plus,
  ArrowUpRight,
  History,
  CircleDollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

export default function IncomePage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    is_recurring: false,
    recurrence_type: 'none',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'all'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);

      let incomeUrl = `/income/?page=${page}&t=${Date.now()}`;
      let summaryUrl = `/summary/monthly/?t=${Date.now()}`;

      if (viewMode === 'monthly') {
        const [year, month] = selectedMonth.split('-');
        incomeUrl += `&month=${month}&year=${year}`;

        const startDate = `${selectedMonth}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const endDate = `${selectedMonth}-${lastDay}`;
        summaryUrl += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const results = await Promise.allSettled([
        api.get(incomeUrl),
        api.get('/categories/'),
        api.get(summaryUrl)
      ]);

      if (results[0].status === 'fulfilled') {
        const incomeRes = results[0].value;
        setIncomes(incomeRes.data.results || incomeRes.data);
        setTotalPages(Math.ceil((incomeRes.data.count || 1) / 10));
      } else {
        toast.error('Failed to load income entries');
      }

      if (results[1].status === 'fulfilled') {
        const catRes = results[1].value;
        setCategories(catRes.data.filter((c: any) => c.category_type === 'INCOME' || c.category_type === 'BOTH'));
      }

      if (results[2].status === 'fulfilled') {
        const summaryRes = results[2].value;
        setSummary(summaryRes.data);
      }
    } catch (error) {
      toast.error('Critical failure in data synchronization');
    } finally {
      setLoading(false);
    }
  }, [page, viewMode, selectedMonth]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/income/${editingId}/`, formData);
        toast.success('Income entry updated');
      } else {
        await api.post('/income/', formData);
        toast.success('Income entry recorded');
      }
      setIsModalOpen(false);
      fetchIncomes();
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await api.delete(`/income/${id}/`);
      toast.success('Entry deleted');
      fetchIncomes();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const openModal = (income?: any) => {
    if (income) {
      setEditingId(income.id);
      setFormData({
        source: income.source,
        amount: income.amount.toString(),
        category_id: income.category?.id?.toString() || '',
        date: income.date,
        description: income.description || '',
        is_recurring: income.is_recurring,
        recurrence_type: income.recurrence_type || 'none',
      });
    } else {
      setEditingId(null);
      setFormData({
        source: '',
        amount: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        is_recurring: false,
        recurrence_type: 'none',
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Income</h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Revenue tracking & distribution
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center p-1 dark:bg-black border dark:border-white/10 rounded-lg">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                viewMode === 'monthly' ? 'dark:bg-white dark:text-black shadow-sm' : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                viewMode === 'all' ? 'dark:bg-white dark:text-black shadow-sm' : 'text-zinc-500 hover:text-foreground'
              }`}
            >
              All Time
            </button>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'monthly' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-9 bg-background dark:bg-black border border-black/10 dark:border-white/10 rounded-lg px-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            size="sm" 
            onClick={() => openModal()}
            className="text-[10px] font-bold uppercase tracking-widest h-9 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/20 px-4"
          >
            <Plus className="size-3.5 mr-2" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Stats and Chart Grid */}
      {/* Stats Summary Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mb-12">
        <Card className="p-4 border-black/10 dark:border-white/10 dark:bg-black shadow-sm min-w-[180px] flex-shrink-0">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Revenue</p>
          <h3 className="text-2xl font-bold tracking-tight tabular-nums flex items-baseline gap-1">
            ₹{parseFloat(viewMode === 'monthly' ? (summary?.current_income_total || 0) : (summary?.all_time_income || 0)).toLocaleString('en-IN')}
            <span className="text-[10px] text-zinc-500">INR</span>
          </h3>
        </Card>

        <Card className="p-4 border-black/10 dark:border-white/10 dark:bg-black shadow-sm min-w-[180px] flex-shrink-0">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Avg. Entry</p>
          <h3 className="text-2xl font-bold tracking-tight tabular-nums flex items-baseline gap-1">
            ₹{(incomes.length > 0 ? (parseFloat(viewMode === 'monthly' ? (summary?.current_income_total || 0) : (summary?.all_time_income || 0)) / incomes.length) : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            <span className="text-[10px] text-zinc-500">INR</span>
          </h3>
        </Card>

        <Card className="p-4 border-black/10 dark:border-white/10 dark:bg-black shadow-sm min-w-[240px] flex-shrink-0 flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Source Mix</p>
            <h3 className="text-2xl font-bold tracking-tight tabular-nums">
              {incomes.length || 0} <span className="text-[10px] text-zinc-500">Entries</span>
            </h3>
          </div>
          <div className="h-[48px] w-[64px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.income_by_category?.length > 0 ? summary.income_by_category : [{ category__name: 'No Data', total: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={14}
                  outerRadius={22}
                  paddingAngle={2}
                  dataKey="total"
                >
                  {summary?.income_by_category?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.category__color || '#10b981'} />
                  ))}
                  {(!summary?.income_by_category || summary.income_by_category.length === 0) && (
                    <Cell fill="var(--muted)" />
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-black/10 dark:border-white/10 dark:bg-black shadow-sm">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center dark:bg-black">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="dark:bg-black border-b dark:border-white/10 text-muted-foreground/70">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Source</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Type</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <LoadingSpinner className="mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Loading transactions...</p>
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <CircleDollarSign className="size-10 mb-2" />
                      <p className="text-sm font-medium">No income recorded</p>
                    </div>
                  </td>
                </tr>
              ) : (
                incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(income.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">{income.source}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: income.category?.color || '#cbd5e1' }} />
                        <span className="text-xs font-medium text-muted-foreground">{income.category?.name || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {income.is_recurring ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Recurring
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">One-time</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        +₹{parseFloat(income.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(income)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(income.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t dark:border-white/10 flex items-center justify-between dark:bg-black">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 text-xs px-3"
              >
                Previous
              </Button>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 text-xs px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Income' : 'Add Income'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Source"
            value={formData.source}
            onChange={e => setFormData({ ...formData, source: e.target.value })}
            required
            placeholder="e.g., Salary, Freelancing"
            className="text-sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (INR)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
              className="text-sm"
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <Select
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="text-sm"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Recurrence
              </label>
              <Select
                value={formData.recurrence_type}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({ 
                    ...formData, 
                    recurrence_type: val,
                    is_recurring: val !== 'none'
                  });
                }}
                className="text-sm"
              >
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add some details..."
            className="h-24 text-sm"
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="text-sm h-10 px-4"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              className="text-sm h-10 px-6"
            >
              {editingId ? 'Save Changes' : 'Add Income'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
