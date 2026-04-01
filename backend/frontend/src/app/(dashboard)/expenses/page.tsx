'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import * as LucideIcons from 'lucide-react';
import { 
  Search, PlusCircle, FileDown, Edit2, Trash, 
  Loader, ArrowLeft, ArrowRight, History, Tags 
} from 'lucide-react';
import toast from 'react-hot-toast';

const DynamicIcon = ({ name, className, style }: { name: string, className?: string, style?: any }) => {
  const IconComponent = (LucideIcons as any)[name] || Tags;
  return <IconComponent className={className} style={style} />;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    is_recurring: false,
    recurrence_type: 'none'
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/expenses/?page=${page}&search=${search}`);
      setExpenses(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10)); // Assuming page_size=10
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleExport = async () => {
    try {
      const response = await api.get('/expenses/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to export expenses');
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
        is_recurring: expense.is_recurring,
        recurrence_type: expense.recurrence_type
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        amount: '',
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        is_recurring: false,
        recurrence_type: 'none'
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
    } catch (error: any) {
      toast.error('Failed to save expense');
    } finally {
      setIsSubmitting(false);
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
            Register and monitor your recent outflows
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="secondary" size="lg" leftIcon={<FileDown className="w-5 h-5" />} onClick={handleExport}>
            Export
          </Button>
          <Button variant="primary" size="lg" leftIcon={<PlusCircle className="w-5 h-5" />} onClick={() => openModal()}>
            Add Expense
          </Button>
        </div>
      </div>

      <Card glass className="p-0 overflow-hidden border-black/5 dark:border-white/5">
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
              Active Session / Registry Entries
           </div>
            <Input 
            label="" 
            placeholder="Search hash..." 
            leftIcon={<Search className="w-4 h-4 text-zinc-600" />}
            className="w-full sm:max-w-xs !bg-transparent border-black/5 dark:border-white/5"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 transition-colors text-zinc-500">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap">
                   <div className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5" />
                      Timestamp
                   </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Title / Index</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Synchronizing Fleet Data...</p>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-zinc-700">
                    <p className="text-[10px] font-black uppercase tracking-widest italic">Zero Entries Detected in Range</p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-6 whitespace-nowrap text-[11px] font-bold text-zinc-500 uppercase italic tabular-nums">
                      {new Date(expense.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground uppercase italic tracking-tight">{expense.title}</span>
                        {expense.notes && <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest truncate max-w-[200px] italic">{expense.notes}</span>}
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
                        <DynamicIcon name={expense.category?.icon || 'Tags'} className="mr-2 size-3.5 opacity-70 group-hover:scale-125 transition-transform" /> 
                        {expense.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-lg font-black text-foreground italic tracking-tighter tabular-nums">
                        ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-zinc-300">
                      {expense.is_recurring ? (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full italic">
                            Recurring / {expense.recurrence_type}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 text-zinc-600 border border-black/5 dark:border-white/5 px-3 py-1 rounded-full italic">
                            Settled / Once
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => openModal(expense)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-black/5 dark:border-white/5">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all border border-black/5 dark:border-white/5">
                          <Trash className="w-4 h-4" />
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
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <Input 
            label="Title" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required
            placeholder="E.g., Grocery Shopping"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Amount (₹)" 
              type="number"
              step="0.01"
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
              required
              placeholder="0.00"
            />
            <Input 
              label="Date" 
              type="date"
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              required
            />
          </div>
          
          <Select 
            label="Category"
            value={formData.category_id}
            onChange={e => setFormData({...formData, category_id: e.target.value})}
            required
            options={[
              { value: '', label: 'Select a category...' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name }))
            ]}
          />

          <div className="flex items-center gap-3 py-1 px-0">
            <input 
              type="checkbox" 
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={e => setFormData({...formData, is_recurring: e.target.checked})}
              className="rounded-md border-white/20 bg-black/50 text-emerald-500 focus:ring-emerald-500/50 size-4"
            />
            <label htmlFor="is_recurring" className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 italic">This is a recurring expense</label>
          </div>

          {formData.is_recurring && (
            <div className="animate-fade-in">
              <Select 
                label="Recurrence Type"
                value={formData.recurrence_type}
                onChange={e => setFormData({...formData, recurrence_type: e.target.value})}
                required
                options={[
                  { value: 'daily', label: 'Daily Sequence' },
                  { value: 'weekly', label: 'Weekly Sequence' },
                  { value: 'monthly', label: 'Monthly Sequence' }
                ]}
              />
            </div>
          )}

          <Textarea 
            label="Notes & Metadata (Optional)"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            placeholder="ENTRY_NOTES"
            className="h-16 uppercase font-medium italic"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="border border-black/5 dark:border-white/5 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-3">Abort</Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-red-600 hover:bg-red-500 border border-white/10 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-4">
                {editingId ? 'Save Changes' : 'Save Expense'}
              </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
