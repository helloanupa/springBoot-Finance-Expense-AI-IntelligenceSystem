import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, ShieldCheck, TrendingUp, Brain } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0d1528 0%, #1a1040 50%, #0a142e 100%)' }}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 float-animation"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '-20%', left: '-20%' }} />
          <div className="absolute w-72 h-72 rounded-full blur-3xl opacity-15 float-animation"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '-10%', right: '-10%', animationDelay: '2s' }} />
          <div className="absolute w-48 h-48 rounded-full blur-2xl opacity-20"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', top: '50%', left: '60%' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center pulse-glow">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinanceAI</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your AI-Powered<br />
            <span className="gradient-text">Financial Brain</span>
          </h1>
          <p className="text-lg" style={{ color: '#9ca3af' }}>
            Get intelligent insights, predict spending, and achieve your financial goals.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: Brain, label: 'AI-powered spending analysis', color: '#6366f1' },
            { icon: TrendingUp, label: 'Predict future expenses', color: '#10b981' },
            { icon: ShieldCheck, label: 'Secure & encrypted data', color: '#06b6d4' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-sm" style={{ color: '#d1d5db' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 lg:hidden mb-6">
                <div className="w-8 h-8 rounded-lg btn-gradient flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="font-bold gradient-text">FinanceAI</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold animated-underline" style={{ color: 'var(--accent-blue)' }}>
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
