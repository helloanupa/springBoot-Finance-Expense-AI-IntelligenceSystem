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
  const [activePeriod, setActivePeriod] = useState('6M');

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
    <div className="dashboard-page container p-4 md:p-6">
      <div className="glass-card dashboard-header-card">
        <div>
          <div className="dashboard-badge">Monthly financial overview</div>
          <h1 className="page-title text-primary">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted">Here is your latest performance snapshot for {format(new Date(), 'MMMM yyyy')}.</p>
        </div>

        <div className="dashboard-header-actions">
          <button className="small-btn btn-gradient" onClick={refetch}><RefreshCw size={14} /> Refresh</button>
          <button className="small-btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={14} /> Add transaction</button>
        </div>
      </div>

      <div className="kpi-grid mt-5">
        <KPI label="Current Balance" value={formatCurrency(summary.balance)} delta={5.2} icon="balance" />
        <KPI label="Income" value={formatCurrency(summary.income)} delta={12.5} icon="income" />
        <KPI label="Expenses" value={formatCurrency(summary.expense)} delta={-3.1} icon="expense" />
        <KPI label="Budget Used" value={`${user?.monthlyBudget ? Math.min((summary.expense / user.monthlyBudget) * 100, 100).toFixed(0) : 0}%`} delta={0} icon="budget" />
      </div>

      <div className="chart-grid">
        <div className="glass-card chart-panel">
          <div className="card-header card-header-spaced">
            <div>
              <h2 className="section-title">Cash flow trend</h2>
              <p className="text-muted">Income and expenses across the last 6 months.</p>
            </div>
            <div className="metric-pill">{activePeriod === '6M' ? '+8.4% vs last period' : 'Stable performance'}</div>
          </div>

          {loading ? <div className="skeleton h-56 mt-4" /> : (
            <ResponsiveContainer width="100%" height={240} className="mt-4">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(148, 163, 184, 0.15)' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={3} dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#6366f1" fill="url(#expenseGrad)" strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          <div className="chart-stats-row">
            <div className="stat-pill">
              <span>Net Revenue</span>
              <strong>{formatCurrency(summary.income - summary.expense)}</strong>
            </div>
            <div className="stat-pill">
              <span>Forecast</span>
              <strong>{formatCurrency((summary.income - summary.expense) * 1.08)}</strong>
            </div>
          </div>
        </div>

        <aside className="right-panel">
          <div className="glass-card summary-card">
            <div className="card-header card-header-spaced">
              <div>
                <h3 className="section-title">Your summary</h3>
                <p className="text-muted">Key numbers to keep your finances on track.</p>
              </div>
            </div>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Available funds</span>
                <strong>{formatCurrency(summary.balance)}</strong>
              </div>
              <div className="summary-item">
                <span>Income</span>
                <strong>{formatCurrency(summary.income)}</strong>
              </div>
              <div className="summary-item">
                <span>Expenses</span>
                <strong>{formatCurrency(summary.expense)}</strong>
              </div>
              <div className="summary-item">
                <span>Budget remaining</span>
                <strong>{user?.monthlyBudget ? formatCurrency(Math.max(user.monthlyBudget - summary.expense, 0)) : '—'}</strong>
              </div>
            </div>
          </div>

          <div className="glass-card insights-card">
            <div className="card-header card-header-spaced">
              <h3 className="section-title">AI insights</h3>
              <button className="small-btn btn-gradient" onClick={generateInsights}><RefreshCw size={14} /></button>
            </div>
            {insights.length === 0 ? (
              <div className="muted-center">No insights available yet.</div>
            ) : (
              <div className="mt-3 space-y-3">
                {insights.map((ins, index) => (
                  <div key={index} className="insight-card">
                    <div className="insight-title">{ins.title}</div>
                    <div className="insight-text">{ins.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="glass-card transactions-card mt-6">
        <div className="card-header card-header-spaced">
          <div>
            <h3 className="section-title">Recent transactions</h3>
            <p className="text-muted">Latest entries from your account activity.</p>
          </div>
          <div className="dashboard-table-actions">
            <button className="small-btn btn-secondary">Export CSV</button>
            <button className="small-btn btn-gradient" onClick={() => setShowAddModal(true)}>New entry</button>
          </div>
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
              {transactions.map((tx) => (
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

      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (data) => { await api.post('/transactions', data); setShowAddModal(false); refetch(); }}
        />
      )}
    </div>
  );
}

