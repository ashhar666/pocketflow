'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import * as LucideIcons from 'lucide-react';
import { Plus, Edit2, Trash2, Loader2, Target, AlertCircle, ShieldCheck, Scale, Zap, BarChartHorizontal, Tags } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DynamicIcon = ({ name, className, style }: { name: string, className?: string, style?: any }) => {
  const IconComponent = (LucideIcons as any)[name] || Tags;
  return <IconComponent className={className} style={style} />;
};

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
      const [budgetsRes, categoriesRes] = await Promise.all([
        api.get('/budgets/'),
        api.get('/categories/')
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load budgets');
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
        await api.put(`/budgets/${editingId}/`, formData);
        toast.success('Budget updated');
      } else {
        await api.post('/budgets/', formData);
        toast.success('Budget created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.non_field_errors?.[0] || 'Failed to save budget');
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

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b border-black/5 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Budget Limits
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Establish fiscal boundaries for your spending
          </p>
        </div>
        <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>
          Add Budget
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : budgets.length === 0 ? (
        <Card glass className="flex flex-col items-center justify-center p-24 text-center border-dashed border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
          <BarChartHorizontal className="w-16 h-16 text-zinc-800 mb-6" />
          <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Zero Limits Define</h2>
          <p className="text-zinc-500 max-w-md mt-4 mb-10 text-sm font-medium uppercase tracking-tight">Establish fiscal boundaries to optimize wealth retention protocols.</p>
          <Button variant="primary" size="lg" onClick={() => openModal()}>Activate Budgets</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {budgets.map((budget, idx) => {
            const spent = parseFloat(budget.spent_amount || '0');
            const total = parseFloat(budget.monthly_limit);
            const percentage = Math.min((spent / total) * 100, 100);
            const remaining = total - spent;
            const isWarning = percentage >= 80 && percentage < 100;
            const isOver = percentage >= 100;
            
            const cardIcons = [ShieldCheck, Scale, Zap, BarChartHorizontal];
            const CardIcon = cardIcons[idx % cardIcons.length];

            let barColor = 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
            if (isWarning) barColor = 'bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]';
            if (isOver) barColor = 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';

            return (
              <Card key={budget.id} glass className="relative overflow-hidden group border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <CardIcon className="size-24" />
                </div>
                
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div 
                      className="size-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500"
                      style={{ 
                        backgroundColor: `${budget.category.color}10`, 
                        border: `1px solid ${budget.category.color}30`,
                        color: budget.category.color
                      }}
                    >
                      <DynamicIcon name={budget.category.icon} className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter leading-tight">{budget.category.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">Sector / Allocation</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => openModal(budget)} className="p-2.5 text-zinc-500 hover:text-foreground bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(budget.id)} className="p-2.5 text-zinc-500 hover:text-red-500 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 hover:border-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-foreground italic tracking-tighter">
                            {spent.toLocaleString('en-IN').replace('₹', '')}
                        </span>
                        <span className="text-xs font-black text-zinc-600 uppercase italic">INR Spent</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic mt-1">
                        System Limit: {formatCurrency(total)}
                      </p>
                    </div>
                    <div className="text-right">
                      {isOver ? (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> LIMIT BREACH
                            </span>
                            <span className="text-xs font-black text-foreground italic tracking-tighter">
                                +{formatCurrency(spent - total)}
                            </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">SAFE ZONE</span>
                            <span className="text-xs font-black text-white italic tracking-tighter">
                                {formatCurrency(remaining)} REMAIN
                            </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* High Definition Progress Bar */}
                  <div className="relative h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className={`absolute h-full rounded-full ${barColor}`} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-zinc-800">0.00%</span>
                    <span className={`${isOver ? 'text-red-500' : isWarning ? 'text-indigo-500' : 'text-emerald-500'} animate-pulse`}>
                      Consumption: {percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Budget' : 'Set New Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Select 
            label="Category"
            value={formData.category_id}
            onChange={e => setFormData({...formData, category_id: e.target.value})}
            required
            disabled={!!editingId}
            options={[
              { value: '', label: 'Select category...' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name }))
            ]}
          />
          {editingId && (
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic px-1 -mt-4">
              Note: System protocol restricts category modification post-creation.
            </p>
          )}

          <Input 
            label="Budget Limit (INR)" 
            type="number"
            step="0.01"
            value={formData.monthly_limit} 
            onChange={e => setFormData({...formData, monthly_limit: e.target.value})} 
            required
            placeholder="500.00"
            className="font-black italic tabular-nums"
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Abort</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
              {editingId ? 'Save Changes' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
