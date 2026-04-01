'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { 
  ArrowUpRight, PlusCircle, Search, 
  Edit2, Trash, Loader, History, TrendingUp,
  DollarSign, Wallet, Building
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function IncomePage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/income/');
      setIncomes(res.data.results || res.data);
    } catch (error) {
      toast.error('Failed to load income data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const openModal = (income?: any) => {
    if (income) {
      setEditingId(income.id);
      setFormData({
        source: income.source,
        amount: income.amount,
        date: income.date,
        description: income.description || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
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

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Income Overview
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Manage and track your incoming cash flow
          </p>
        </div>
        <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-500 border-indigo-400/20" leftIcon={<PlusCircle className="w-5 h-5" />} onClick={() => openModal()}>
          Add Income
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card glass className="p-6 border-indigo-500/20 bg-indigo-500/[0.02]">
           <div className="flex items-center gap-4 mb-4">
              <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Historical Yield</p>
           </div>
           <h3 className="text-3xl font-black text-foreground italic tracking-tighter">
             {formatCurrency(incomes.reduce((acc, curr) => acc + parseFloat(curr.amount), 0)).replace('₹', '')}
             <span className="text-sm ml-2 text-zinc-600 font-bold not-italic">INR</span>
           </h3>
        </Card>
      </div>

      <Card glass className="p-0 overflow-hidden border-black/5 dark:border-white/5">
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-center">
           <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
              Registry / Inbound Streams
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 text-zinc-500">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Source / Origin</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Tracing Cashflows...</p>
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-zinc-700">
                    <p className="text-[10px] font-black uppercase tracking-widest italic">No Inbound Transfers Detected</p>
                  </td>
                </tr>
              ) : (
                incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-6 text-[11px] font-bold text-zinc-500 uppercase italic tabular-nums">
                      {new Date(income.date).toLocaleDateString().toUpperCase()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground uppercase italic tracking-tight">{income.source}</span>
                        {income.description && <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest italic">{income.description}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-emerald-400 italic tracking-tighter tabular-nums">
                        +₹{parseFloat(income.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(income)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-foreground transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      <button onClick={() => handleDelete(income.id)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-red-500 transition-all">
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
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Modify Inflow' : 'Register Inflow'}
      >
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <Input 
            label="Source ID (Origin)" 
            value={formData.source} 
            onChange={e => setFormData({...formData, source: e.target.value})} 
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
              onChange={e => setFormData({...formData, amount: e.target.value})} 
              required
              placeholder="0.00"
              className="text-emerald-400 font-black italic tabular-nums"
            />
            <Input 
              label="Timeline" 
              type="date"
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              required
            />
          </div>
          
          <Textarea 
            label="Notes & Metadata"
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="ENTRY_NOTES"
            className="h-16 uppercase italic font-medium"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="border border-black/5 dark:border-white/5 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-3">Abort</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 uppercase text-[9px] font-black tracking-widest italic py-1.5 px-4">
              {editingId ? 'Save Changes' : 'Save Income'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
