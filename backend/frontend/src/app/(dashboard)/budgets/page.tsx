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
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';

export default function BudgetsPage() {
  const { user } = useAuth();
  const preferredCurrency = user?.preferred_currency || 'INR';
  
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
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Budgets</h1>
          <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">Set and manage your monthly spending limits.</p>
        </div>
        <Button
          onClick={() => openModal()}
          variant="primary"
          size="sm"
          className="h-9 px-4"
          leftIcon={<Plus className="size-4" />}
        >
          Create Budget
        </Button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="flex justify-center mb-4"><LoadingSpinner size={32} /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-16 border-dashed border-white/10 text-center relative overflow-hidden group dark:bg-black">
          <Target className="size-16 mx-auto mb-6 opacity-10 text-primary relative z-10" />
          <h3 className="text-sm font-bold text-muted-foreground relative z-10 uppercase tracking-tight">No Budgets Found</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2 relative z-10">Create a budget to start tracking</p>
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
                <Card className={`p-5 border-black/5 dark:border-white/10 dark:bg-black shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md border-l-4 ${borderColor.replace('border-', 'border-l-')}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-9 rounded-lg flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: budget.category?.color || '#10b981' }}
                      >
                        <Target className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                          {budget.category?.name}
                        </h3>
                        <p className={`text-[10px] font-medium uppercase tracking-wider ${statusColor}`}>
                          {isOver ? 'Over Budget' : isWarn ? 'Warning' : 'On Track'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button onClick={() => openModal(budget)} className="size-7 rounded-md bg-white/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-white/5">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => handleDelete(budget.id)} className="size-7 rounded-md bg-white/5 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors border border-white/5">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-bold tracking-tight">{formatCurrency(spent, preferredCurrency)}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">of {formatCurrency(limit, preferredCurrency)} limit</span>
                    </div>

                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${barColor.split(' ')[0]}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <span>{Math.round((spent/limit)*100)}% Spent</span>
                      <span>{isOver ? `${formatCurrency(Math.abs(limit - spent), preferredCurrency)} Over` : `${formatCurrency(remaining, preferredCurrency)} Left`}</span>
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
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1 -mt-4 border-l-2 border-zinc-500/50 pl-2">
              Note: Category cannot be changed later.
            </p>
          )}

          <Input
            label={`Budget Limit (${preferredCurrency})`}
            type="number"
            step="0.01"
            value={formData.monthly_limit}
            onChange={e => setFormData({ ...formData, monthly_limit: e.target.value })}
            required
            placeholder="0.00"
            className="font-semibold tabular-nums text-lg"
          />

          <div className="pt-6 flex justify-end gap-2 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} variant="primary" size="sm" className="px-6">
              {editingId ? 'Save Changes' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
