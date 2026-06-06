import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';
import api from '../lib/api';
import { format, subMonths } from 'date-fns';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm" style={{ minWidth: 130 }}>
      <p className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ${(p.value || 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({ monthlyData: [], categoryData: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.get('/transactions/analytics/summary?months=6');
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const mKey = { year: d.getFullYear(), month: d.getMonth() + 1 };
        const income = data.data.monthlyData.find(m =>
          m._id.year === mKey.year && m._id.month === mKey.month && m._id.type === 'income')?.total || 0;
        const expense = data.data.monthlyData.find(m =>
          m._id.year === mKey.year && m._id.month === mKey.month && m._id.type === 'expense')?.total || 0;
        months.push({ name: format(d, 'MMM yy'), month: format(d, 'MMM'), income, expense, savings: income - expense });
      }
      setAnalytics({
        monthlyData: months,
        categoryData: data.data.categoryData.map((c, i) => ({
          name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
          value: Math.round(c.total),
          count: c.count,
          color: COLORS[i % COLORS.length]
        }))
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', Icon: BarChart3 },
    { id: 'trends', label: 'Trends', Icon: TrendingUp },
    { id: 'categories', label: 'Categories', Icon: PieIcon },
    { id: 'savings', label: 'Savings Rate', Icon: Activity },
  ];

  const totalIncome = analytics.monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpense = analytics.monthlyData.reduce((s, m) => s + m.expense, 0);
  const totalSavings = totalIncome - totalExpense;
  const avgSavingsRate = totalIncome > 0 ? (totalSavings / totalIncome * 100) : 0;

  const savingsData = analytics.monthlyData.map(m => ({
    name: m.month,
    rate: m.income > 0 ? parseFloat(((m.income - m.expense) / m.income * 100).toFixed(1)) : 0
  }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>6-month financial overview</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, color: '#10b981' },
          { label: 'Total Expenses', value: `$${totalExpense.toLocaleString()}`, color: '#ef4444' },
          { label: 'Net Savings', value: `$${totalSavings.toLocaleString()}`, color: '#6366f1' },
          { label: 'Avg Savings Rate', value: `${avgSavingsRate.toFixed(1)}%`, color: '#f59e0b' }
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center">
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === id ? 'text-white' : ''
            }`}
            style={activeTab === id
              ? { background: 'var(--accent-blue)' }
              : { color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="glass-card p-6 h-80 skeleton rounded-2xl" />
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'overview' && (
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Monthly Income vs Expenses</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Spending Trend</h2>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analytics.monthlyData}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke="#6366f1" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h2 className="text-base font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Spending by Category</h2>
                {analytics.categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No expense data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={analytics.categoryData} cx="50%" cy="50%" outerRadius={100}
                        paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {analytics.categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={v => [`$${v}`, '']} contentStyle={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px'
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="glass-card p-6">
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Category Breakdown</h2>
                <div className="space-y-3">
                  {analytics.categoryData.map((c, i) => {
                    const total = analytics.categoryData.reduce((s, x) => s + x.value, 0);
                    const pct = total > 0 ? (c.value / total * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.count} tx</span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>${c.value.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full rounded-full" style={{ background: c.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Monthly Savings Rate (%)</h2>
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Target: 20% savings rate</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={savingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={v => [`${v}%`, 'Savings Rate']} contentStyle={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px'
                  }} />
                  {/* Target line at 20% */}
                  <Line type="monotone" dataKey="rate" name="Savings %" stroke="#6366f1" strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
