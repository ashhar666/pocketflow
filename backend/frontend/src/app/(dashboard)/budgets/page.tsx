'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { 
  Plus, 
  Target, 
  Pencil,
  Trash2
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    monthly_limit: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [budgetsResult, categoriesResult] = await Promise.allSettled([
        api.get('/budgets/'),
        api.get('/categories/'),
      ]);

      if (budgetsResult.status === 'fulfilled') {
        setBudgets(budgetsResult.value.data);
      } else {
        toast.error('Failed to load budgets');
        console.error('Budgets error:', budgetsResult.reason);
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value.data);
      } else {
        toast.error('Failed to load categories');
        console.error('Categories error:', categoriesResult.reason);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (budget?: any) => {
    if (budget) {
      setEditingId(budget.id);
      setFormData({
        category_id: budget.category.id.toString(),
        monthly_limit: budget.monthly_limit,
      });
    } else {
      setEditingId(null);
      setFormData({
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        monthly_limit: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/budgets/${editingId}/`, formData);
        toast.success('Budget updated');
      } else {
        await api.post('/budgets/', formData);
        toast.success('Budget created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      const data = error.response?.data;
      const msg =
        data?.non_field_errors?.[0] ||
        data?.detail ||
        (typeof data === 'object' && data !== null ? (Object.values(data)[0] as any)?.[0] : null) ||
        'Failed to save budget';
      toast.error(String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.delete(`/budgets/${id}/`);
        toast.success('Budget deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-black/5 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">
            Budgets
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">
            Set limits for your categories
          </p>
        </div>
        <Button 
          variant="primary" 
          size="md" 
          leftIcon={<Plus className="size-4" />}
          onClick={() => openModal()}
          className="text-[10px] uppercase font-black italic tracking-widest px-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        >
          Create Budget
        </Button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="flex justify-center mb-4"><LoadingSpinner size={32} /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <Card glass className="p-16 border-black/5 dark:border-white/5 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <Target className="size-16 mx-auto mb-6 opacity-10 text-emerald-500 relative z-10" />
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 italic relative z-10">No Budgets Found</h3>
          <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.2em] mt-2 relative z-10">Create a budget to start tracking</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
          {budgets.map((budget, index) => {
            const limit = parseFloat(budget.monthly_limit);
            const spent = parseFloat(budget.spent_amount);
            const percentage = Math.min((spent / limit) * 100, 100);
            const remaining = Math.max(limit - spent, 0);

            const isOver = spent > limit;
            const isWarn = percentage >= 80 && !isOver;
            
            const statusColor = isOver ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-emerald-500';
            const barColor = isOver ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isWarn ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
            const borderColor = isOver ? 'border-red-500/20' : isWarn ? 'border-amber-500/20' : 'border-emerald-500/20';

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={budget.id}
                className="h-full"
              >
                <Card glass className={`p-6 h-full flex flex-col justify-between gap-6 relative overflow-hidden group shadow-sm transition-all duration-300 hover:shadow-xl border ${borderColor}`}>
                  
                  {/* Category Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-10 rounded-xl flex items-center justify-center text-white relative overflow-hidden shadow-sm"
                        style={{ backgroundColor: budget.category?.color || '#10b981' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        <Target className="size-5 relative z-10" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-foreground">
                          {budget.category?.name}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">
                          {isOver ? 'Over Budget' : isWarn ? 'Warning' : 'On Track'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(budget)} className="size-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => handleDelete(budget.id)} className="size-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financials & Progress */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black italic tabular-nums tracking-tighter">₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      <span className="text-[10px] uppercase font-bold italic text-zinc-500 tracking-widest whitespace-nowrap">/ ₹{limit.toLocaleString('en-IN', { maximumFractionDigits: 0 })} limits</span>
                    </div>

                    <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest text-zinc-500">
                      <span className={statusColor}>{Math.round((spent/limit)*100)}% Used</span>
                      <span>{isOver ? `+₹${Math.abs(limit - spent).toLocaleString('en-IN', { maximumFractionDigits: 0 })} OVER` : `₹${remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })} LEFT`}</span>
                    </div>
                  </div>

                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modern High-Tech Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Budget' : 'Create Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-4">
          <Select
            label="Category"
            value={formData.category_id}
            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
            required
            disabled={!!editingId}
            options={[
              { value: '', label: 'Select category...' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name }))
            ]}
          />
          {editingId && (
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic px-1 -mt-4 border-l-2 border-zinc-500/50 pl-2">
              Note: Category cannot be changed later.
            </p>
          )}

          <Input
            label="Budget Limit (INR)"
            type="number"
            step="0.01"
            value={formData.monthly_limit}
            onChange={e => setFormData({ ...formData, monthly_limit: e.target.value })}
            required
            placeholder="0.00"
            className="font-black italic tabular-nums text-lg"
          />

          <div className="pt-6 flex justify-end gap-3 border-t border-black/5 dark:border-white/5">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] uppercase font-black tracking-widest italic">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-[10px] uppercase font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] tracking-widest italic px-6">
              {editingId ? 'Save Changes' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
