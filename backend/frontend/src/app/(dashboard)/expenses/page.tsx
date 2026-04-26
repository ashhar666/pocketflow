'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { formatScanFailure } from '@/lib/scanError';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Scan, 
  Download, 
  Receipt, 
  Trash2, 
  Pencil, 
  History, 
  Search,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Loader2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get(`/expenses/?page=${page}&search=${search}&ordering=${ordering}`),
        api.get('/categories/'),
        api.get('/summary/monthly/')
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

    } catch (error) {
      toast.error('Critical failure in data synchronization');
    } finally {
      setLoading(false);
    }
  }, [page, search, ordering]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // fetchCategories call is redundant now due to fetchExpenses using allSettled, 
  // but I'll keep it for safe migrations if needed, or remove it.
  // Actually, I'll remove it as fetchExpenses now handles Categories.

  const handleExport = async () => {
    let url = '';
    try {
      toast.loading('Generating PDF...', { id: 'export-loading' });
      // Add timestamp to bypass cache
      const response = await api.get(`/expenses/export/?t=${Date.now()}`, { responseType: 'blob' });
      
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
      link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded', { id: 'export-loading' });
    } catch (error: any) {
      console.error('Export Error:', error);
      toast.error(error.message || 'Failed to export expenses', { id: 'export-loading' });
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
        category_id: expense.category?.id?.toString() || '',
        date: expense.date,
        notes: expense.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        amount: '',
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
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
        toast.success('Expense updated');
      } else {
        await api.post('/expenses/', formData);
        toast.success('Expense created');
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setIsModalOpen(true); // Open modal to show scanning status
    setEditingId(null); // Ensure we are creating new

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/expenses/scan_receipt/', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;
      console.log('AI Extraction Result:', data);

      if (data.error) {
        throw new Error(data.error);
      }

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
        notes: data.notes || `AI_AUTO_SAVE: ${data.category_suggestion || 'UNCATEGORIZED'}`,
      };

      // Perform Auto-Save immediately
      await api.post('/expenses/', newExpense);

      setAutoSavedData({
        ...newExpense,
        category_name: matchedCategory?.name || 'Default'
      });
      setIsAutoSaved(true);
      fetchExpenses();
      toast.success('Receipt scanned & saved automatically!');

      // Close modal after delay
      setTimeout(() => {
        setIsModalOpen(false);
        setIsAutoSaved(false);
        setAutoSavedData(null);
      }, 2500);

    } catch (error: any) {
      console.error('Scan Error Details:', error.response?.data || error);
      const errorMessage = formatScanFailure(error);
      toast.error(`Scan Failure: ${errorMessage}`);
      setIsModalOpen(false); // Close on hard fail so they can try again or manual
    } finally {
      setIsScanning(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}/`);
        toast.success('Expense deleted');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Expenses History
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Track your recent spending
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleScanReceipt}
          />
          <Button
            variant="glass"
            size="md"
            leftIcon={<Scan className="size-4" />}
            onClick={() => fileInputRef.current?.click()}
            className="border-emerald-500/20 hover:border-emerald-500/40 text-[10px] uppercase font-black italic tracking-widest px-6"
          >
            Scan Receipt
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            leftIcon={<FileDown className="size-4" />}
            onClick={handleExport}
            className="text-[10px] uppercase font-black italic tracking-widest px-6"
          >
            Export PDF
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            leftIcon={<Plus className="size-4" />}
            onClick={() => openModal()}
            className="text-[10px] uppercase font-black italic tracking-widest px-6"
          >
            Add Expense
          </Button>
        </div>
      </div>

      <Card glass className="p-0 overflow-hidden border-black/5 dark:border-white/5">
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
            <History className="size-3 text-zinc-500" />
            Expense History
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-zinc-500" />
              <Input
                label=""
                placeholder="Search history..."
                className="w-full pl-9 !bg-transparent border-black/5 dark:border-white/5 text-[10px] font-bold uppercase italic"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label=""
                value={ordering}
                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                options={[
                  { value: '-date', label: 'NEWEST FIRST' },
                  { value: 'date', label: 'OLDEST FIRST' },
                  { value: '-amount', label: 'HIGHEST AMOUNT' },
                  { value: 'amount', label: 'LOWEST AMOUNT' },
                  { value: 'title', label: 'TITLE (A-Z)' },
                ]}
                className="!bg-transparent border-black/5 dark:border-white/5 text-[10px] font-bold uppercase italic"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 transition-colors text-zinc-500">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap">
                  Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Title / Index</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex justify-center mb-4">
                      <LoadingSpinner size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Updating list...</p>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-zinc-700">
                    <Receipt className="size-12 mx-auto mb-4 opacity-5" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">No expenses found</p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap text-[11px] font-bold text-zinc-500 uppercase italic tabular-nums">
                      {new Date(expense.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-9 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all border border-black/5 dark:border-white/5">
                          <Receipt className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground uppercase italic tracking-tight">{expense.title}</span>
                          {expense.notes && <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest truncate max-w-[200px] italic">{expense.notes}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic border transition-colors duration-300"
                        style={{
                          backgroundColor: `${expense.category?.color || '#a1a1aa'}10`,
                          color: expense.category?.color || '#a1a1aa',
                          borderColor: `${expense.category?.color || '#a1a1aa'}20`
                        }}
                      >
                        {expense.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-lg font-black text-foreground italic tracking-tighter tabular-nums">
                        ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => openModal(expense)} className="size-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all border border-black/5 dark:border-white/5">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="size-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all border border-black/5 dark:border-white/5">
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
              >
                PREV
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                NEXT
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isAutoSaved ? 'Saved!' : (isScanning ? 'Scanning...' : (editingId ? 'Edit Expense' : 'Add Expense'))}
      >
        {isAutoSaved ? (
          <div className="py-8 space-y-6 flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tighter italic text-emerald-500">Saved Successfully</h3>
              <div className="bg-black/20 dark:bg-white/5 p-6 rounded-2xl border border-white/5 space-y-2 min-w-[280px]">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">{autoSavedData?.date}</p>
                <div className="flex items-center justify-center gap-2">
                  <Receipt className="size-3 text-zinc-400" />
                  <p className="text-sm font-black uppercase italic tracking-tight">{autoSavedData?.title}</p>
                </div>
                <p className="text-2xl font-black text-white italic tracking-tighter">₹{autoSavedData?.amount}</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-400 border border-white/10 px-3 py-1 rounded-full">
                    {autoSavedData?.category_name}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-[0.2em] animate-pulse">Closing in 2s...</p>
          </div>
        ) : isScanning ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="flex justify-center mb-4">
              <LoadingSpinner size={48} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest italic text-foreground">Scanning receipt...</p>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em] mt-1">Reading details...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-1.5">
            {!editingId && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer mb-6 p-4 rounded-2xl border-2 border-dashed border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-emerald-500/[0.02] hover:border-emerald-500/20 transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="size-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all font-black text-xs italic text-zinc-500 group-hover:text-emerald-500">
                  SCAN
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Scan Another Receipt</p>
                  <p className="text-[8px] text-zinc-600 font-medium uppercase tracking-[0.15em]">AI-Powered Data Extraction</p>
                </div>
              </div>
            )}
            <Input
              label="Title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="E.g., Grocery Shopping"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (₹)"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
              />
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
                { value: '', label: 'Select a category...' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
            />

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ENTRY_NOTES"
              className="h-16 uppercase font-medium italic"
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="border border-black/5 dark:border-white/5 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-3">Cancel</Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-red-600 hover:bg-red-500 border border-white/10 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-4">
                {editingId ? 'Save Changes' : 'Save Expense'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
