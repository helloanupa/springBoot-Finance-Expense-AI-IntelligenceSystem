import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight,
  ArrowDownRight, Brain, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import AddTransactionModal from '../components/AddTransactionModal';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

const StatCard = ({ title, value, icon: Icon, change, color, glow }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-6 ${glow}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <h3 className="text-2xl font-bold count-animate" style={{ color: 'var(--text-primary)' }}>{value}</h3>
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    {change !== undefined && (
      <div className="flex items-center gap-1">
        {change >= 0 ? <ArrowUpRight size={14} style={{ color: '#10b981' }} /> : <ArrowDownRight size={14} style={{ color: '#ef4444' }} />}
        <span className="text-xs font-medium" style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}>
          {Math.abs(change)}% from last month
        </span>
      </div>
    )}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm shadow-xl" style={{ minWidth: 140 }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ${p.value?.toFixed(0)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, summary, loading } = useTransactions({ limit: 5 });
  const [analyticsData, setAnalyticsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { addTransaction, refetch } = useTransactions();

  useEffect(() => {
    loadAnalytics();
    loadInsights();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.get('/transactions/analytics/summary?months=6');
      // Process monthly data
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const monthKey = { year: d.getFullYear(), month: d.getMonth() + 1 };
        const income = data.data.monthlyData.find(m => m._id.year === monthKey.year && m._id.month === monthKey.month && m._id.type === 'income')?.total || 0;
        const expense = data.data.monthlyData.find(m => m._id.year === monthKey.year && m._id.month === monthKey.month && m._id.type === 'expense')?.total || 0;
        months.push({ name: format(d, 'MMM'), income, expense });
      }
      setAnalyticsData(months);
      setCategoryData(data.data.categoryData.map((c, i) => ({
        name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
        value: c.total,
        color: COLORS[i % COLORS.length]
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadInsights = async () => {
    try {
      const data = await api.get('/ai/insights');
      setInsights(data.data?.slice(0, 3) || []);
    } catch (err) { /* silent */ }
  };

  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await api.post('/ai/insights');
      setInsights(data.data?.slice(0, 3) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const budgetUsage = user?.monthlyBudget > 0
    ? Math.min((summary.expense / user.monthlyBudget) * 100, 100)
    : 0;

  const formatCurrency = (v) => `$${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const severityColors = { info: '#6366f1', warning: '#f59e0b', critical: '#ef4444', positive: '#10b981' };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="btn-gradient px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 text-white">
          <Plus size={16} /> Add Transaction
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={formatCurrency(summary.balance)} icon={Wallet}
          color="#6366f1" glow="card-glow-blue" change={5.2} />
        <StatCard title="Total Income" value={formatCurrency(summary.income)} icon={TrendingUp}
          color="#10b981" glow="card-glow-green" change={12.5} />
        <StatCard title="Total Expenses" value={formatCurrency(summary.expense)} icon={TrendingDown}
          color="#ef4444" glow="card-glow-red" change={-3.1} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 card-glow-purple">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Budget Usage</p>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{budgetUsage.toFixed(0)}%</h3>
            </div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: '#8b5cf620', border: '1px solid #8b5cf630' }}>
              <Brain size={20} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full"
              style={{ background: budgetUsage > 80 ? '#ef4444' : budgetUsage > 60 ? '#f59e0b' : '#10b981' }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {formatCurrency(summary.expense)} / {formatCurrency(user?.monthlyBudget)} budget
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="glass-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Income vs Expenses</h2>
          {loading ? (
            <div className="h-48 skeleton rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="expense" name="Expenses" stroke="#6366f1" fill="url(#expenseGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Spending Categories</h2>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No expense data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v.toFixed(0)}`, '']} contentStyle={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px'
                }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 space-y-1">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                </div>
                <span style={{ color: 'var(--text-primary)' }}>${c.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="glass-card p-6 gradient-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} style={{ color: 'var(--accent-blue)' }} />
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>AI Insights</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={generateInsights} disabled={insightsLoading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-gradient text-white">
              <RefreshCw size={12} className={insightsLoading ? 'animate-spin' : ''} />
              {insightsLoading ? 'Analyzing...' : 'Refresh'}
            </motion.button>
          </div>

          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No insights yet. Add transactions and generate AI analysis.</p>
              <button onClick={generateInsights}
                className="btn-gradient text-white text-xs px-4 py-2 rounded-lg">
                Generate Insights
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <motion.div key={insight._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5"
                    style={{ color: severityColors[insight.severity] || '#6366f1' }} />
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{insight.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
            <a href="/transactions" className="text-xs animated-underline" style={{ color: 'var(--accent-blue)' }}>View all →</a>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 6).map((tx, i) => (
                <motion.div key={tx._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 cursor-pointer">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    {tx.type === 'income'
                      ? <TrendingUp size={16} style={{ color: '#10b981' }} />
                      : <TrendingDown size={16} style={{ color: '#ef4444' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {tx.category} · {format(new Date(tx.date), 'MMM d')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold"
                    style={{ color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (data) => {
            await addTransaction(data);
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
