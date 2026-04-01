'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { 
  Plus, Edit2, Trash2, Loader2, 
  ShoppingBag, Coffee, Utensils, Car, Home, 
  Zap, Heart, Film, Smartphone, Gift, 
  Briefcase, GraduationCap, Plane, Dumbbell, 
  Stethoscope, Landmark, CreditCard, Receipt as ReceiptIcon
} from 'lucide-react';
import { Tags } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', 
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const AVAILABLE_ICONS = [
  { name: 'ShoppingBag', label: 'Shopping' },
  { name: 'Coffee', label: 'Coffee' },
  { name: 'Utensils', label: 'Food' },
  { name: 'Car', label: 'Transport' },
  { name: 'Home', label: 'Housing' },
  { name: 'Zap', label: 'Utilities' },
  { name: 'Heart', label: 'Health' },
  { name: 'Film', label: 'Entertainment' },
  { name: 'Smartphone', label: 'Tech' },
  { name: 'Gift', label: 'Gifts' },
  { name: 'Briefcase', label: 'Work' },
  { name: 'GraduationCap', label: 'Education' },
  { name: 'Plane', label: 'Travel' },
  { name: 'Dumbbell', label: 'Fitness' },
  { name: 'Stethoscope', label: 'Medical' },
  { name: 'Landmark', label: 'Taxes' },
  { name: 'CreditCard', label: 'Finance' },
  { name: 'ReceiptIcon', label: 'Bill' },
  { name: 'Tags', label: 'Other' }
];

const DynamicIcon = ({ name, className, style }: { name: string, className?: string, style?: any }) => {
  const IconComponent = (LucideIcons as any)[name] || Tags;
  return <IconComponent className={className} style={style} />;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tags',
    color: COLORS[0],
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category?: any) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        icon: 'Tags',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Only emoji allowed check basic simple regex
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}/`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/categories/', formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure? Expenses associated with this category might be affected or set to null.')) {
      try {
        await api.delete(`/categories/${id}/`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Organize your transactions into sectors
          </p>
        </div>
        <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />} onClick={() => openModal()}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Card 
              key={cat.id} 
              className="flex flex-col relative group border-black/5 dark:border-white/5 transition-all duration-300 p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="size-12 rounded-xl flex items-center justify-center border"
                  style={{ 
                    backgroundColor: `${cat.color}10`, 
                    borderColor: `${cat.color}30`,
                    color: cat.color
                  }}
                >
                  <DynamicIcon name={cat.icon} className="size-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(cat)} className="p-2 text-zinc-500 hover:text-foreground">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-zinc-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-foreground truncate">{cat.name}</h3>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mt-1">
                {cat.expenses_count || 0} Transactions
              </p>
            </Card>
          ))}
          
          <button 
            onClick={() => openModal()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-2xl p-8 transition-all group min-h-[140px]"
          >
            <Plus className="w-6 h-6 text-zinc-500 group-hover:text-foreground transition-colors" />
            <p className="text-xs font-medium text-zinc-500 group-hover:text-foreground mt-3 transition-colors">Add New</p>
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div>
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-4 italic px-1">Icon Selection</label>
            <div className="grid grid-cols-6 gap-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
              {AVAILABLE_ICONS.map(icon => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setFormData({...formData, icon: icon.name})}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all border ${formData.icon === icon.name ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-500 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10'}`}
                  title={icon.label}
                >
                  <DynamicIcon name={icon.name} className="size-5" />
                </button>
              ))}
            </div>
          </div>
          
          <Input 
            label="Category Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required
            placeholder="E.g., High-Yield Instruments"
            className="uppercase font-black italic tracking-tight"
          />

          <div>
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-3 italic px-1">Theme Color</label>
            <div className="grid grid-cols-8 gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`w-8 h-8 rounded-full transition-transform outline-none ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Abort</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
              {editingId ? 'Save Changes' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
