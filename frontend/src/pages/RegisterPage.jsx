import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = (p) => {
    if (!p) return { label: '', color: '#374151', width: 0 };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [
      { label: 'Very Weak', color: '#ef4444', width: 20 },
      { label: 'Weak', color: '#f59e0b', width: 40 },
      { label: 'Fair', color: '#f59e0b', width: 60 },
      { label: 'Strong', color: '#10b981', width: 80 },
      { label: 'Very Strong', color: '#10b981', width: 100 }
    ];
    return levels[score - 1] || levels[0];
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to FinanceAI!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      {/* Background decorator */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 float-animation"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '-10%', right: '-10%' }} />
        <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-10 float-animation"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '10%', left: '-5%', animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center pulse-glow">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FinanceAI</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Start your AI-powered financial journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-12" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.width}%` }}
                      className="h-full rounded-full transition-all"
                      style={{ background: strength.color }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <input type="password" className="input-field pr-12" placeholder="Repeat password"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#10b981' }} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gradient w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold animated-underline" style={{ color: 'var(--accent-blue)' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
