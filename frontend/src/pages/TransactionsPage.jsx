import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Trash2, Edit3, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions } from '../hooks/useTransactions';
import AddTransactionModal from '../components/AddTransactionModal';

const CATEGORIES = ['all', 'food', 'transport', 'entertainment', 'shopping', 'health',
  'utilities', 'education', 'salary', 'freelance', 'investment', 'gift', 'other'];

const categoryColors = {
  food: '#f59e0b', transport: '#6366f1', entertainment: '#ec4899',
  shopping: '#8b5cf6', health: '#10b981', utilities: '#06b6d4',
  education: '#3b82f6', salary: '#10b981', freelance: '#6366f1',
  investment: '#f59e0b', gift: '#ec4899', other: '#9ca3af'
};

export default function TransactionsPage() {
  const [filters, setFilters] = useState({ type: '', category: '', limit: 10, page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { transactions, summary, pagination, loading, addTransaction, deleteTransaction, updateTransaction } = useTransactions(filters);

  const filtered = searchQuery
    ? transactions.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : transactions;

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {pagination.total} total transactions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setEditTx(null); setShowModal(true); }}
          className="btn-gradient px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 text-white self-start sm:self-auto">
          <Plus size={16} /> Add Transaction
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Income', value: summary.income, color: '#10b981', Icon: TrendingUp },
          { label: 'Expenses', value: summary.expense, color: '#ef4444', Icon: TrendingDown },
          { label: 'Balance', value: summary.balance, color: '#6366f1', Icon: ArrowUpDown }
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="glass-card p-4 text-center">
            <Icon size={16} className="mx-auto mb-1" style={{ color }} />
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-sm font-bold" style={{ color }}>${(value || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9 py-2.5" placeholder="Search transactions..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select className="input-field py-2.5 md:w-40" value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="input-field py-2.5 md:w-40" value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value, page: 1 })}>
            {CATEGORIES.map(c => (
              <option key={c} value={c === 'all' ? '' : c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowUpDown size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No transactions found</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {searchQuery ? 'Try a different search term' : 'Get started by adding your first transaction'}
            </p>
            <button onClick={() => setShowModal(true)} className="btn-gradient text-white px-4 py-2 rounded-xl text-sm">
              Add Transaction
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
              <div className="col-span-1">Type</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              <AnimatePresence>
                {filtered.map((tx, i) => (
                  <motion.div key={tx._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-4 md:px-6 py-4 items-center hover:bg-white/5 transition-all">
                    {/* Icon */}
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                        {tx.type === 'income'
                          ? <TrendingUp size={14} style={{ color: '#10b981' }} />
                          : <TrendingDown size={14} style={{ color: '#ef4444' }} />}
                      </div>
                    </div>
                    {/* Description */}
                    <div className="col-span-7 md:col-span-3">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                      <p className="text-xs md:hidden" style={{ color: 'var(--text-muted)' }}>
                        {tx.category} · {format(new Date(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    {/* Category */}
                    <div className="hidden md:block md:col-span-2">
                      <span className="text-xs px-2 py-1 rounded-lg font-medium capitalize"
                        style={{
                          background: `${categoryColors[tx.category] || '#6b7280'}20`,
                          color: categoryColors[tx.category] || '#6b7280'
                        }}>
                        {tx.category.replace('_', ' ')}
                      </span>
                    </div>
                    {/* Date */}
                    <div className="hidden md:block md:col-span-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {format(new Date(tx.date), 'MMM d, yyyy')}
                    </div>
                    {/* Amount */}
                    <div className="col-span-2 text-sm font-bold"
                      style={{ color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <button onClick={() => { setEditTx(tx); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                        style={{ color: 'var(--text-muted)' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(tx._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                        style={{ color: 'var(--text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Page {filters.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                    className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30"
                    style={{ color: 'var(--text-secondary)' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={filters.page >= pagination.pages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                    className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30"
                    style={{ color: 'var(--text-secondary)' }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddTransactionModal
          initialData={editTx}
          onClose={() => { setShowModal(false); setEditTx(null); }}
          onAdd={async (data) => {
            if (editTx) {
              await updateTransaction(editTx._id, data);
            } else {
              await addTransaction(data);
            }
            setShowModal(false);
            setEditTx(null);
          }}
        />
      )}
    </div>
  );
}
