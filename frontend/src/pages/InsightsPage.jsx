import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, RefreshCw, AlertCircle, Info,
  CheckCircle2, XCircle, TrendingUp, Target, Zap
} from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';

const severityConfig = {
  positive: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', Icon: CheckCircle2 },
  info: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', Icon: Info },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', Icon: AlertCircle },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', Icon: XCircle }
};

const insightTypeLabels = {
  spending_analysis: { label: 'Spending Analysis', Icon: TrendingUp },
  budget_prediction: { label: 'Budget Forecast', Icon: Target },
  overspending_alert: { label: 'Alert', Icon: AlertCircle },
  savings_suggestion: { label: 'Savings Tip', Icon: Sparkles },
  monthly_report: { label: 'Monthly Report', Icon: Brain },
  pattern_detection: { label: 'Pattern', Icon: Zap }
};

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predLoading, setPredLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const [filter, setFilter] = useState('all');
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await api.get('/ai/insights');
      setInsights(data.data || []);
    } catch (err) { console.error(err); }
    finally { setInitialLoad(false); }
  };

  const generateInsights = async () => {
    setLoading(true);
    try {
      const data = await api.post('/ai/insights');
      setInsights(prev => [...(data.data || []), ...prev]);
      setAiPowered(data.aiPowered);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const generatePrediction = async () => {
    setPredLoading(true);
    try {
      const data = await api.post('/ai/prediction');
      setPrediction(data.data);
    } catch (err) { console.error(err); }
    finally { setPredLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/ai/insights/${id}/read`);
      setInsights(prev => prev.map(i => i._id === id ? { ...i, isRead: true } : i));
    } catch (err) { /* silent */ }
  };

  const filtered = filter === 'all' ? insights : insights.filter(i => i.severity === filter || i.insightType === filter);
  const unread = insights.filter(i => !i.isRead).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Insights</h1>
            {aiPowered && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--accent-blue)' }}>
                GPT-Powered
              </span>
            )}
            {unread > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                style={{ background: '#ef4444' }}>
                {unread} new
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            AI-powered analysis of your financial behavior
          </p>
        </div>
        <button
          onClick={generateInsights} disabled={loading}
          className="btn-gradient px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 text-white self-start sm:self-auto">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      {/* AI Prediction Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card gradient-border p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center pulse-glow">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Next Month Forecast</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI-predicted spending for next month</p>
            </div>
          </div>
          <button onClick={generatePrediction} disabled={predLoading}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-all"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            <RefreshCw size={12} className={predLoading ? 'animate-spin' : ''} />
            {predLoading ? 'Predicting...' : 'Generate Forecast'}
          </button>
        </div>

        {prediction ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold gradient-text">${parseFloat(prediction.totalPredicted).toLocaleString()}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>predicted</span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                <span>Confidence: <strong style={{ color: '#10b981' }}>{prediction.confidence}</strong></span>
              </div>
              {prediction.note && (
                <p className="text-xs p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  💡 {prediction.note}
                </p>
              )}
              {prediction.warnings?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {prediction.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 text-xs p-2 rounded-lg"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                      <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {prediction.categories?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>By Category</p>
                <div className="space-y-2">
                  {prediction.categories.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                      <div className="flex items-center gap-2">
                        {c.trend && (
                          <span className="text-xs" style={{
                            color: c.trend === 'up' ? '#ef4444' : c.trend === 'down' ? '#10b981' : '#9ca3af'
                          }}>
                            {c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '→'}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-primary)' }}>${parseFloat(c.predicted).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Target size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Generate a forecast to see your predicted spending for next month
            </p>
          </div>
        )}
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'positive', 'info', 'warning', 'critical'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium capitalize whitespace-nowrap transition-all border`}
            style={filter === f
              ? { background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', color: 'white' }
              : { background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            {f === 'all' ? `All (${insights.length})` : f}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      {initialLoad ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 skeleton rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Brain size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No insights yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Add some transactions and click "Generate Insights" to get your AI financial analysis
          </p>
          <button onClick={generateInsights}
            className="btn-gradient text-white px-6 py-2.5 rounded-xl font-medium text-sm">
            Generate Insights
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((insight, i) => {
              const sev = severityConfig[insight.severity] || severityConfig.info;
              const typeInfo = insightTypeLabels[insight.insightType] || { label: 'Insight', Icon: Brain };
              return (
                <motion.div
                  key={insight._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 cursor-pointer transition-all ${!insight.isRead ? 'gradient-border' : ''}`}
                  onClick={() => markRead(insight._id)}
                  style={{ borderColor: !insight.isRead ? sev.border : 'var(--border-color)' }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                      <sev.Icon size={18} style={{ color: sev.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: sev.bg, color: sev.color }}>
                          {typeInfo.label}
                        </span>
                        {!insight.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{insight.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {insight.message}
                  </p>
                  <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(insight.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
