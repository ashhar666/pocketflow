'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
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

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get(`/income/?page=${page}`),
        api.get('/categories/'),
        api.get('/summary/monthly/')
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
  }, [page]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const openModal = (income?: any) => {
    if (income) {
      setEditingId(income.id);
      setFormData({
        source: income.source,
        amount: income.amount,
        category_id: income.category?.id?.toString() || '',
        date: income.date,
        description: income.description || '',
        is_recurring: income.is_recurring || false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/income/${editingId}/`, formData);
        toast.success('Income entry updated');
      } else {
        await api.post('/income/', formData);
        toast.success('Income entry created');
      }
      setIsModalOpen(false);
      fetchIncomes();
    } catch (error: any) {
      toast.error('Failed to save income entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this income record? This will decrease your total balance.')) {
      try {
        await api.delete(`/income/${id}/`);
        toast.success('Entry removed');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  const handleExport = async () => {
    let url = '';
    try {
      toast.loading('Generating PDF...', { id: 'export-loading' });
      // Add timestamp to bypass cache
      const response = await api.get(`/income/export/?t=${Date.now()}`, { responseType: 'blob' });
      
      // If the backend returns JSON error, Axios might still treat it as a blob
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || 'Export failed');
      }

      // Basic integrity check: A valid PDF should be at least a few hundred bytes
      if (response.data.size < 100) {
        throw new Error('Received corrupt or empty PDF file');
      }

      url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Income_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded', { id: 'export-loading' });
    } catch (error: any) {
      console.error('Export Error:', error);
      toast.error(error.message || 'Failed to export income data', { id: 'export-loading' });
    } finally {
      if (url) window.URL.revokeObjectURL(url);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 md:pb-8 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Income Overview
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Manage and track your incoming cash flow
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Download className="size-3" />}
            className="w-full sm:w-auto justify-center print:hidden border-black/10 dark:border-white/10 px-6 font-black uppercase italic tracking-widest text-[10px]"
            onClick={handleExport}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="size-3" />}
            className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-500 border-indigo-400/20 print:hidden px-6 font-black uppercase italic tracking-widest text-[10px]"
            onClick={() => openModal()}
          >
            Add Income
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card glass className="relative overflow-hidden p-6 lg:col-span-2 border-indigo-500/20 bg-indigo-500/[0.02]">
          <TrendingUp className="absolute -right-4 -bottom-4 size-32 text-indigo-500/5 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <Wallet className="size-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Total Income</p>
            </div>
            <div className="text-[10px] font-black text-emerald-500 uppercase italic flex items-center gap-1">
              <ArrowUpRight className="size-3" />
              {summary?.income_percentage_change?.toFixed(1) || 0}%
            </div>
          </div>
          <h3 className="relative z-10 text-3xl font-black text-foreground italic tracking-tighter">
            {formatCurrency(summary?.current_income_total || 0).replace('₹', '')}
            <span className="text-sm ml-2 text-zinc-600 font-bold not-italic">INR</span>
          </h3>
        </Card>

        {/* Income Distribution Chart */}
        <Card glass className="p-6 lg:col-span-2 border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Where from?</p>
            </div>
          </div>
          <div className="h-28 w-full">
            {summary?.income_by_category && summary.income_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.income_by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="amount"
                    label={({ name, percent }: any) => (typeof window !== 'undefined' && window.innerWidth > 768) ? `${name} ${(percent * 100).toFixed(0)}%` : null}
                    labelLine={typeof window !== 'undefined' && window.innerWidth > 768}
                  >
                    {summary.income_by_category.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="currentColor" className="stroke-background" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] font-black uppercase text-zinc-700 italic tracking-widest">
                Categorization Data Unavailable
              </div>
            )}
          </div>
          {summary?.income_by_category && summary.income_by_category.length > 0 && (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-dashed border-muted-foreground/20">
              {summary.income_by_category.map((entry: any, index: number) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-1.5 w-1.5 rounded-full ring-1 ring-foreground/10"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground truncate">{entry.name}</span>
                  </div>
                  <span className="text-xs font-black text-foreground tabular-nums">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card glass className="p-0 overflow-hidden border-black/5 dark:border-white/5">
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
            Income History
          </div>
        </div>

        {/* Mobile View: Card List */}
        <div className="md:hidden divide-y divide-black/5 dark:divide-white/5">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="size-12 border border-indigo-500/20 rounded-xl flex items-center justify-center font-black italic text-[10px] text-indigo-500 animate-spin mx-auto mb-4 border-t-indigo-500">
                <History className="size-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Loading income...</p>
            </div>
          ) : incomes.length === 0 ? (
            <div className="px-6 py-12 text-center text-zinc-700">
              <CircleDollarSign className="size-12 mx-auto mb-4 opacity-5 text-zinc-500" />
              <p className="text-[10px] font-black uppercase tracking-widest italic">No Inbound Transfers Detected</p>
            </div>
          ) : (
            incomes.map((income) => (
              <div key={income.id} className="p-6 space-y-4 hover:bg-black/[0.01] transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-indigo-500/5 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shrink-0">
                      <ArrowUpRight className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-foreground uppercase italic tracking-tight leading-none mb-1 truncate">{income.source}</h4>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic leading-none">
                        {income.category?.name || 'UNCATEGORIZED'} • {new Date(income.date).toLocaleDateString().toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400 italic tracking-tighter tabular-nums leading-none mb-1">
                      +₹{parseFloat(income.amount).toLocaleString('en-IN')}
                    </div>
                    {income.is_recurring && (
                      <span className="text-[8px] font-black text-emerald-500 uppercase italic opacity-80 tracking-widest">RECURRING</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <div className="text-[9px] text-zinc-500 font-medium uppercase italic max-w-[60%] truncate">
                    {income.description || 'No additional metadata'}
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => openModal(income)} className="text-[10px] font-black uppercase italic text-zinc-500 hover:text-foreground flex items-center gap-1">
                      <Pencil className="size-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(income.id)} className="text-[10px] font-black uppercase italic text-zinc-500 hover:text-red-500 flex items-center gap-1">
                      <Trash2 className="size-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 text-zinc-500">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Source / Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex justify-center mb-4">
                      <LoadingSpinner size={32} className="text-indigo-500/40" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Updating list...</p>
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-zinc-700">
                    <CircleDollarSign className="size-12 mx-auto mb-4 opacity-10 text-zinc-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">No income found</p>
                  </td>
                </tr>
              ) : (
                incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-6 text-[11px] font-bold text-zinc-500 uppercase italic tabular-nums">
                      {new Date(income.date).toLocaleDateString().toUpperCase()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-8 rounded-lg bg-indigo-500/5 flex items-center justify-center text-indigo-500 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                          <ArrowUpRight className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground uppercase italic tracking-tight">{income.source}</span>
                          <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest italic">
                            {income.category?.name || 'UNCATEGORIZED'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {income.is_recurring ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 w-fit">
                          <History className="size-3 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase italic">RECURRING</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-600 uppercase italic opacity-50">One-time</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-emerald-400 italic tracking-tighter tabular-nums">
                        +₹{parseFloat(income.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(income)} className="size-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-foreground transition-all border border-black/5 dark:border-white/5">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => handleDelete(income.id)} className="size-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all border border-black/5 dark:border-white/5">
                          <Trash2 className="size-3.5" />
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
          <div className="p-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Page {page} of {totalPages}</span>
            <div className="flex gap-4">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-[9px] font-black uppercase italic tracking-widest px-4"
              >
                Previous
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-[9px] font-black uppercase italic tracking-widest px-4"
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
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <Input
            label="Source"
            value={formData.source}
            onChange={e => setFormData({ ...formData, source: e.target.value })}
            required
            placeholder="E.G., SALARY, DIVIDENDS"
            className="uppercase font-black italic tracking-tight"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Volume (INR)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
              className="text-emerald-400 font-black italic tabular-nums"
            />
            <Input
              label="Timeline"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic flex items-center gap-2 mb-1">
                Category
              </label>
              <Select
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="bg-black/20 border-white/5 text-[11px] font-bold uppercase italic"
              >
                <option value="">UNCATEGORIZED</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic flex items-center gap-2 mb-1">
                Recurrence
              </label>
              <Select
                value={formData.recurrence_type}
                onChange={e => setFormData({ ...formData, recurrence_type: e.target.value })}
                className="bg-black/20 border-white/5 text-[11px] font-bold uppercase italic"
              >
                <option value="none">ONE-TIME</option>
                <option value="daily">DAILY</option>
                <option value="weekly">WEEKLY</option>
                <option value="monthly">MONTHLY</option>
              </Select>
            </div>
          </div>

          <Textarea
            label="Notes"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="ENTRY_NOTES"
            className="h-16 uppercase italic font-medium"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="border border-black/5 dark:border-white/5 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-3">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-4">
              {editingId ? 'Save Changes' : 'Save Income'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
