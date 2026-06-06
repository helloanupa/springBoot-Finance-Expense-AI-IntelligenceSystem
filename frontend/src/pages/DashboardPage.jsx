import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { format, subMonths } from 'date-fns';
import AddTransactionModal from '../components/AddTransactionModal';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

function KPI({ label, value, delta, icon }) {
  return (
    <div className="glass-card kpi-card">
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
      <div className="text-muted">{delta >= 0 ? `▲ ${delta}%` : `▼ ${Math.abs(delta)}%`}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { transactions, summary, loading, refetch } = useTransactions({ limit: 6 });
  const [analyticsData, setAnalyticsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { loadAnalytics(); loadInsights(); }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.get('/transactions/analytics/summary?months=6');
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const monthKey = { year: d.getFullYear(), month: d.getMonth() + 1 };
        const income = data.data.monthlyData.find(m => m._id.year === monthKey.year && m._id.month === monthKey.month && m._id.type === 'income')?.total || 0;
        const expense = data.data.monthlyData.find(m => m._id.year === monthKey.year && m._id.month === monthKey.month && m._id.type === 'expense')?.total || 0;
        months.push({ name: format(d, 'MMM'), income, expense });
      }
      setAnalyticsData(months);
      setCategoryData(data.data.categoryData.map((c, i) => ({ name: c._id, value: c.total, color: COLORS[i % COLORS.length] })));
    } catch (err) { console.error(err); }
  };

  const loadInsights = async () => {
    try { const data = await api.get('/ai/insights'); setInsights(data.data?.slice(0, 4) || []); } catch (err) { /* silent */ }
  };

  const generateInsights = async () => {
    setInsightsLoading(true);
    try { const data = await api.post('/ai/insights'); setInsights(data.data?.slice(0, 4) || []); } catch (err) { console.error(err); } finally { setInsightsLoading(false); }
  };

  const formatCurrency = (v) => `$${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  return (
    <div className="container p-4 md:p-6">
      <div className="card-header">
        <div>
          <h1 className="page-title text-primary">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="filter-bar">
          <button className="small-btn btn-gradient" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add</button>
          <div className="chip">Last 6 months</div>
        </div>
      </div>

      <div className="kpi-grid mt-4">
        <KPI label="Balance" value={formatCurrency(summary.balance)} delta={5.2} />
        <KPI label="Income" value={formatCurrency(summary.income)} delta={12.5} />
        <KPI label="Expenses" value={formatCurrency(summary.expense)} delta={-3.1} />
        <KPI label="Budget Usage" value={`${user?.monthlyBudget ? Math.min((summary.expense/user.monthlyBudget)*100,100).toFixed(0) : 0}%`} delta={0} />
      </div>

      <div className="chart-grid">
        <div className="glass-card chart-card">
          <h2 className="section-title">Income vs Expenses</h2>
          {loading ? <div className="skeleton h-56 mt-4" /> : (
            <ResponsiveContainer width="100%" height={220} className="mt-2">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#6366f1" fill="url(#expenseGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card chart-card">
          <h2 className="section-title">Spending Categories</h2>
          {categoryData.length === 0 ? (
            <div className="muted-center">No expense categories yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200} className="mt-2">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-grid mt-6">
        <div>
          <div className="glass-card transactions-card">
            <div className="card-header">
              <h3 className="section-title">Recent Transactions</h3>
            </div>
            {loading ? (
              <div className="skeleton h-40 mt-4" />
            ) : transactions.length === 0 ? (
              <div className="muted-center">No transactions yet</div>
            ) : (
              <table className="transactions-table mt-3">
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Category</th><th className="text-right">Amount</th></tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx._id}>
                      <td>{format(new Date(tx.date), 'MMM d')}</td>
                      <td>{tx.description}</td>
                      <td>{tx.category}</td>
                      <td className="text-right" style={{ color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>{tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="right-panel">
          <div className="glass-card">
            <div className="card-header">
              <h3 className="section-title">AI Insights</h3>
              <button className="small-btn btn-gradient" onClick={generateInsights}><RefreshCw size={14} /></button>
            </div>
            {insights.length === 0 ? (
              <div className="muted-center">No insights — generate one</div>
            ) : (
              <div className="mt-3 space-y-2">
                {insights.map((ins, i) => (
                  <div key={i} className="glass-card" style={{ background: 'var(--bg-secondary)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{ins.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ins.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 className="section-title">Budget</h3>
            <div className="mt-2">
              <div className="text-muted">Monthly Budget</div>
              <div className="kpi-value mt-1">{user?.monthlyBudget ? `$${user.monthlyBudget}` : 'Not set'}</div>
            </div>
          </div>
        </aside>
      </div>

      {showAddModal && (<AddTransactionModal onClose={() => setShowAddModal(false)} onAdd={async (data) => { await api.post('/transactions', data); setShowAddModal(false); refetch(); }} />)}
    </div>
  );
}

