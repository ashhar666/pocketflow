'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SavingsPage() {
  const [savings, setSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fundingId, setFundingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '0',
    target_date: '',
  });

  const [fundAmount, setFundAmount] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/savings/');
      setSavings(res.data);
    } catch (error) {
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (goal?: any) => {
    if (goal) {
      setEditingId(goal.id);
      setFormData({
        title: goal.title,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        target_date: goal.deadline || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        target_amount: '',
        current_amount: '0',
        target_date: '',
      });
    }
    setIsModalOpen(true);
  };

  const openFundModal = (goal: any) => {
    setFundingId(goal.id);
    setFundAmount('');
    setIsFundModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { 
        title: formData.title,
        target_amount: formData.target_amount,
        current_amount: formData.current_amount,
        deadline: formData.target_date, 
      };
      
      if (editingId) {
        await api.put(`/savings/${editingId}/`, payload);
        toast.success('Goal updated');
      } else {
        await api.post('/savings/', payload);
        toast.success('Goal created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      const errs = error.response?.data ? JSON.stringify(error.response.data) : null;
      toast.error(errs || 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingId) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`/savings/${fundingId}/add_money/`, { amount: fundAmount });
      toast.success('Funds added successfully! 🎉');
      setIsFundModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add funds');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this specific goal?')) {
      try {
        await api.delete(`/savings/${id}/`);
        toast.success('Goal deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
            Savings Goals
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Track your progress towards financial milestones
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => openModal()} className="px-6 font-bold uppercase tracking-widest text-[10px]">
          Add Goal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size={32} />
        </div>
      ) : savings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-24 text-center border-dashed border-white/10 dark:bg-black">
          <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight">No savings goals yet</h2>
          <p className="text-zinc-500 max-w-md mt-4 mb-10 text-[10px] font-bold uppercase tracking-widest">Add your first savings goal to start tracking your milestones.</p>
          <Button variant="primary" size="md" onClick={() => openModal()} className="font-bold uppercase tracking-widest text-[10px]">Create Goal</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {savings.map((goal, idx) => {
            const current = parseFloat(goal.current_amount);
            const target = parseFloat(goal.target_amount);
            const percentage = Math.min((current / target) * 100, 100);
            const isCompleted = percentage >= 100;
            

            
            return (
              <Card key={goal.id} className="relative overflow-hidden group border-white/10 dark:bg-black transition-all duration-500 p-8">
                
                <div className="flex justify-between items-start mb-8 relative z-20">
                  <div className="flex items-center gap-5">
                    <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-all duration-500 text-[10px] font-bold uppercase tracking-widest">
                       SAVE
                    </div>
                    <div className="pr-4">
                       <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Goal #{goal.id.toString().padStart(4, '0')}</h5>
                      <h3 className="text-xl font-bold text-foreground uppercase tracking-tight flex items-center gap-3">
                        {goal.title}
                        {isCompleted && <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                      </h3>
                      {goal.deadline && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                          Target: {new Date(goal.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                   <div className="flex gap-2">
                    <button onClick={() => openModal(goal)} className="px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground bg-white/5 rounded-lg border border-white/10 transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground hover:text-red-500 bg-white/5 rounded-lg border border-white/10 transition-all">
                      Del
                    </button>
                  </div>
                </div>

                 <div className="space-y-6">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-bold text-foreground tracking-tighter">
                            {current.toLocaleString('en-IN').replace('₹', '')}
                           </span>
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">INR Saved</span>
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                            Target: {formatCurrency(target)}
                        </p>
                    </div>
                    {!isCompleted && (
                      <Button variant="indigo" size="sm" onClick={() => openFundModal(goal)}>
                        Add Money
                      </Button>
                    )}
                  </div>

                  <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className={`absolute h-full rounded-full bg-gradient-to-r ${isCompleted ? 'from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground/80">Progress: {percentage.toFixed(1)}%</span>
                    {!isCompleted && <span className="text-muted-foreground/60">{formatCurrency(target - current)} TO GO</span>}
                    {isCompleted && <span className="text-emerald-500">Savings Completed!</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Goal' : 'Create Savings Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input 
            label="Goal Name" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required
            placeholder="E.g., Emergency Fund"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Target Amount (₹)" 
              type="number"
              step="0.01"
              value={formData.target_amount} 
              onChange={e => setFormData({...formData, target_amount: e.target.value})} 
              required
              placeholder="10000.00"
            />
            <Input 
              label="Current Amount (₹)" 
              type="number"
              step="0.01"
              value={formData.current_amount} 
              onChange={e => setFormData({...formData, current_amount: e.target.value})} 
              required
              disabled={!editingId} // Usually start at 0 but allow edit if needed
            />
          </div>
          
          <Input 
            label="Target Date" 
            type="date"
            value={formData.target_date} 
            onChange={e => setFormData({...formData, target_date: e.target.value})} 
            required
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
              {editingId ? 'Save Changes' : 'Save Goal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        title="Contribute to Goal"
        width="sm"
      >
        <form onSubmit={handleFundSubmit} className="space-y-4 pt-4">
          <Input 
            label="Amount to Add (₹)" 
            type="number"
            step="0.01"
            value={fundAmount} 
            onChange={e => setFundAmount(e.target.value)} 
            required
            placeholder="50.00"
            autoFocus
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsFundModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500">
              Add Money
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
