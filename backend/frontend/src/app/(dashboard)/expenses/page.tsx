'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { formatScanFailure } from '@/lib/scanError';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingDown,
  Wallet,
  Plus,
  Scan,
  Trash2,
  Pencil,
  Search,
  CheckCircle2,
  FileDown,
  Receipt,
  Filter
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';

// Lazy-load recharts - it's a large library and the mini pie chart is non-critical
const PieSkeleton = () => <div className="h-[40px] w-full animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded" />;
const MiniCategoryPie = dynamic(() => import('./MiniCategoryPie'), {
  ssr: false,
  loading: PieSkeleton,
});

export default function ExpensesPage() {
  const { user } = useAuth();
  const preferredCurrency = user?.preferred_currency || 'INR';
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-date');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(false);
  const [autoSavedData, setAutoSavedData] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'INR',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    is_recurring: false,
    recurrence_type: 'none',
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get(`/expenses/?page=${page}&search=${search}&ordering=${ordering}`),
        api.get('/categories/'),
        api.get(`/summary/monthly/?t=${Date.now()}`)
      ]);

      if (results[0].status === 'fulfilled') {
        const res = results[0].value;
        setExpenses(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 10));
      } else {
        toast.error('Failed to load expenses');
      }

      if (results[1].status === 'fulfilled') {
        setCategories(results[1].value.data);
      }

      if (results[2].status === 'fulfilled') {
        setSummary(results[2].value.data);
      }

    } catch (error) {
      toast.error('Data synchronization failed');
    } finally {
      setLoading(false);
    }
  }, [page, search, ordering]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleExport = async () => {
    let url = '';
    try {
      toast.loading('Generating report...', { id: 'export-loading' });
      const response = await api.get(`/expenses/export/?t=${Date.now()}`, { responseType: 'blob' });

      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || 'Export failed');
      }

      url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Expenses_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded', { id: 'export-loading' });
    } catch (error: any) {
      toast.error(error.message || 'Export failed', { id: 'export-loading' });
    } finally {
      if (url) window.URL.revokeObjectURL(url);
    }
  };

  const openModal = (expense?: any) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency || 'INR',
        category_id: expense.category?.id?.toString() || '',
        date: expense.date,
        notes: expense.notes || '',
        is_recurring: expense.is_recurring,
        recurrence_type: expense.recurrence_type || 'none',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        amount: '',
        currency: 'INR',
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
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
        await api.put(`/expenses/${editingId}/`, formData);
        toast.success('Updated');
      } else {
        await api.post('/expenses/', formData);
        toast.success('Saved');
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setIsModalOpen(true);
    setEditingId(null);

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/expenses/scan_receipt/', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;
      if (data.error) throw new Error(data.error);

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
        notes: data.notes || `AI Scan: ${data.category_suggestion || 'Unknown'}`,
      };

      await api.post('/expenses/', newExpense);
      setAutoSavedData({ ...newExpense, category_name: matchedCategory?.name || 'Uncategorized' });
      setIsAutoSaved(true);
      fetchExpenses();
      toast.success('Scanned & Saved');

      setTimeout(() => {
        setIsModalOpen(false);
        setIsAutoSaved(false);
        setAutoSavedData(null);
      }, 2000);

    } catch (error: any) {
      toast.error(formatScanFailure(error));
      setIsModalOpen(false);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}/`);
        toast.success('Deleted');
        fetchExpenses();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Expenses</h1>
          <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">Manage and track your outgoings.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleScanReceipt} accept="image/*" />
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Scan className="size-4" />}
          >
            Scan
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={handleExport}
            leftIcon={<FileDown className="size-4" />}
          >
            Export
          </Button>
          <Button
            onClick={() => openModal()}
            variant="primary"
            size="sm"
            className="h-9 px-4"
            leftIcon={<Plus className="size-4" />}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-rose-500/10 rounded-xl">
              <TrendingDown className="size-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Monthly Spend</p>
              <h3 className="text-xl font-bold tracking-tight tabular-nums">
                {formatCurrency(parseFloat(summary?.current_month_total || 0), preferredCurrency)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Wallet className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Avg. Entry</p>
              <h3 className="text-xl font-bold tracking-tight tabular-nums">
                {formatCurrency((expenses.length > 0 ? (parseFloat(summary?.current_month_total || 0) / expenses.length) : 0), preferredCurrency)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-black/5 dark:border-white/10 dark:bg-black shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Category Mix</p>
              <MiniCategoryPie data={summary?.by_category} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Entries</p>
              <h3 className="text-xl font-bold tracking-tight">{expenses.length || 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-black/5 dark:border-white/10 shadow-sm overflow-hidden dark:bg-black">
          {/* Table Header / Filters */}
          <div className="p-4 border-b dark:border-white/10 dark:bg-black flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-background dark:bg-black border dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="size-4 text-muted-foreground hidden sm:block" />
              <select
                className="bg-background dark:bg-black border dark:border-white/10 rounded-lg text-sm p-2 focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
                value={ordering}
                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
              >
                <option value="-date">Newest</option>
                <option value="date">Oldest</option>
                <option value="-amount">Highest</option>
                <option value="amount">Lowest</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="dark:bg-black text-muted-foreground/70 border-b dark:border-white/10 uppercase text-[10px] font-bold tracking-widest">
                  <th className="px-6 py-3 font-bold">Date</th>
                  <th className="px-6 py-3 font-bold">Description</th>
                  <th className="px-6 py-3 font-bold">Category</th>
                  <th className="px-6 py-3 font-bold">Type</th>
                  <th className="px-6 py-3 font-bold">Amount</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <LoadingSpinner size={24} />
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-xs tabular-nums">
                        {new Date(expense.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{expense.title}</span>
                          {expense.notes && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {expense.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                          style={{
                            backgroundColor: `${expense.category?.color || '#a1a1aa'}10`,
                            color: expense.category?.color || '#a1a1aa',
                            borderColor: `${expense.category?.color || '#a1a1aa'}30`
                          }}
                        >
                          {expense.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expense.is_recurring ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            Recurring
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 opacity-50">One-time</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold tabular-nums text-red-500">
                        {formatCurrency(expense.amount, expense.currency || 'INR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(expense)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t dark:border-white/10 flex items-center justify-between dark:bg-black">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isAutoSaved ? 'Saved!' : (isScanning ? 'Scanning...' : (editingId ? 'Edit' : 'Add'))}
      >
        {isAutoSaved ? (
          <div className="py-8 text-center space-y-4">
            <div className="size-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="font-medium">{autoSavedData?.title}</p>
              <p className="text-2xl font-bold">{formatCurrency(autoSavedData?.amount, autoSavedData?.currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">{autoSavedData?.category_name}</p>
            </div>
          </div>
        ) : isScanning ? (
          <div className="py-12 text-center space-y-4">
            <LoadingSpinner size={32} className="mx-auto" />
            <p className="text-sm text-muted-foreground">Extracting receipt details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <Input
              label="Description"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. Grocery store"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Select
                    label="CCY"
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    required
                    options={[
                      { value: 'INR', label: 'INR' },
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'GBP', label: 'GBP' },
                      { value: 'JPY', label: 'JPY' },
                      { value: 'CAD', label: 'CAD' },
                      { value: 'AUD', label: 'AUD' },
                    ]}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <Select
              label="Category"
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              required
              options={[
                { value: '', label: 'Select category' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
            />

            <Select
              label="Recurrence"
              value={formData.recurrence_type}
              onChange={e => {
                const val = e.target.value;
                setFormData({ 
                  ...formData, 
                  recurrence_type: val,
                  is_recurring: val !== 'none'
                });
              }}
              required
              options={[
                { value: 'none', label: 'One-time' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes"
              className="h-20"
            />

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
