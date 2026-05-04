'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];



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
    category_type: 'EXPENSE',
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
        category_type: category.category_type || 'EXPENSE',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        icon: 'Tags',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        category_type: 'EXPENSE',
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
            Organize your transactions into groups
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => openModal()} className="px-6 font-black uppercase italic tracking-widest text-[10px]">
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-24">
          <LoadingSpinner size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="flex flex-col relative group border-black/5 dark:border-white/5 transition-all duration-300 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="h-1.5 w-12 rounded-full"
                  style={{
                    backgroundColor: cat.color,
                  }}
                />
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(cat)} className="text-[10px] font-black uppercase italic text-zinc-500 hover:text-foreground">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-[10px] font-black uppercase italic text-zinc-500 hover:text-red-500">Delete</button>
                </div>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-foreground truncate">{cat.name}</h3>
              <div className="flex justify-between items-end mt-2">
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  {cat.transaction_count || 0} {cat.transaction_count === 1 ? 'Entry' : 'Entries'}
                </p>
                <span className={`text-[8px] font-black tracking-[0.2em] uppercase italic px-2 py-0.5 rounded border ${
                   cat.category_type === 'INCOME' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                   cat.category_type === 'BOTH' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' :
                   'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                }`}>
                  {cat.category_type || 'EXPENSE'}
                </span>
              </div>
            </Card>
          ))}

          <button
            onClick={() => openModal()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 rounded-2xl p-8 transition-all group min-h-[140px]"
          >
            <p className="text-[10px] font-black uppercase italic tracking-widest text-zinc-500 group-hover:text-foreground transition-colors">Add New Category</p>
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">


          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="E.g., Groceries"
              className="uppercase font-black italic tracking-tight"
            />
            <Select
              label="Type"
              value={formData.category_type}
              onChange={e => setFormData({ ...formData, category_type: e.target.value })}
              required
              options={[
                { value: 'EXPENSE', label: 'EXPENSE ONLY' },
                { value: 'INCOME', label: 'INCOME ONLY' },
                { value: 'BOTH', label: 'BOTH' },
              ]}
              className="font-black italic tracking-tight"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-3 italic px-1">Theme Color</label>
            <div className="grid grid-cols-8 gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-transform outline-none ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
              {editingId ? 'Save Changes' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
