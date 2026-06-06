import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag, Calendar, FileText, Repeat } from 'lucide-react';

const EXPENSE_CATEGORIES = ['food', 'transport', 'entertainment', 'shopping', 'health', 'utilities', 'education', 'other'];
const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'gift', 'other_income'];

export default function AddTransactionModal({ onClose, onAdd, initialData }) {
  const [form, setForm] = useState({
    type: initialData?.type || 'expense',
    category: initialData?.category || '',
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
    isRecurring: initialData?.isRecurring || false,
    recurringFrequency: initialData?.recurringFrequency || ''
  });
  const [loading, setLoading] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({ ...form, amount: parseFloat(form.amount) });
    } catch(err) { /* handled in hook */ } 
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="glass-card w-full max-w-md p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {initialData ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-all"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex rounded-xl p-1 mb-5" style={{ background: 'var(--bg-secondary)' }}>
            {['expense', 'income'].map(t => (
              <button key={t} onClick={() => setForm({ ...form, type: t, category: '' })}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${form.type === t ? 'text-white' : ''}`}
                style={form.type === t ? { background: t === 'income' ? '#10b981' : '#ef4444' } : { color: 'var(--text-muted)' }}>
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Amount *</label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="number" step="0.01" min="0.01" required
                  className="input-field pl-9" placeholder="0.00"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all border ${
                      form.category === cat ? 'text-white' : ''
                    }`}
                    style={form.category === cat
                      ? { background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }
                      : { borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description *</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3 top-3.5" style={{ color: 'var(--text-muted)' }} />
                <input type="text" required className="input-field pl-9" placeholder="e.g., Grocery shopping"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="date" className="input-field pl-9"
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <Repeat size={15} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>Recurring transaction</span>
              <button type="button" onClick={() => setForm({ ...form, isRecurring: !form.isRecurring })}
                className={`w-11 h-6 rounded-full transition-all relative ${form.isRecurring ? '' : 'bg-gray-600'}`}
                style={form.isRecurring ? { background: 'var(--accent-blue)' } : {}}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.isRecurring ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            {form.isRecurring && (
              <select className="input-field" value={form.recurringFrequency}
                onChange={e => setForm({ ...form, recurringFrequency: e.target.value })}>
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !form.category}
              className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (initialData ? 'Update Transaction' : 'Add Transaction')}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
