import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      { label: 'Medium', color: '#fbbf24', width: 60 },
      { label: 'Strong', color: '#10b981', width: 85 },
      { label: 'Very Strong', color: '#34d399', width: 100 }
    ];
    return levels[Math.min(score - 1, 4)] || levels[0];
  };

  const strength = passwordStrength(form.password);
  const passwordsMatch = form.confirm && form.password === form.confirm;
  const passwordsVisible = form.password && form.confirm;

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
    <div className="auth-page">
      <div className="auth-card auth-card-split">
        <div className="auth-form-panel auth-form-panel-yellow">
          <div className="auth-brand">
            <div className="brand-pill">FinanceAI</div>
          </div>
          <div className="auth-copy">
            <h1>Create an account</h1>
            <p>Sign up and get a 30-day free trial with intelligent finance insights.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              <span>Full name</span>
              <input
                type="text"
                className="auth-input"
                placeholder="Amélie Laurent"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                className="auth-input"
                placeholder="amélielaurent7622@gmail.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>

            <label>
              <span>Password</span>
              <div className="auth-input-group">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input auth-input-password"
                  placeholder="••••••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label>
              <span>Confirm password</span>
              <div className="auth-input-group">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-input auth-input-password"
                  placeholder="••••••••••••••••"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button type="submit" disabled={loading || !passwordsMatch} className="auth-submit auth-submit-yellow">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="social-buttons">
            <button className="auth-social auth-social-light"><span></span> Apple</button>
            <button className="auth-social auth-social-light"><span>G</span> Google</button>
          </div>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="auth-visual-panel">
          <div className="hero-content">
            <div className="hero-pill">Task Review With Team</div>
            <div className="hero-title">Stay productive with one clean workspace.</div>
            <div className="hero-subtitle">Visualize your schedule, meetings, and key collaborators at a glance.</div>
          </div>

          <div className="hero-card">
            <div className="hero-calendar">
              <div className="hero-day active">Sun<br /><strong>22</strong></div>
              <div className="hero-day">Mon<br /><strong>23</strong></div>
              <div className="hero-day">Tue<br /><strong>24</strong></div>
              <div className="hero-day">Wed<br /><strong>25</strong></div>
              <div className="hero-day">Thu<br /><strong>26</strong></div>
              <div className="hero-day">Fri<br /><strong>27</strong></div>
              <div className="hero-day">Sat<br /><strong>28</strong></div>
            </div>

            <div className="hero-info-card">
              <div>
                <div className="hero-info-label">Daily Meeting</div>
                <div className="hero-info-time">12:00pm - 01:00pm</div>
              </div>
              <div className="avatar-row">
                <div className="avatar avatar-lg" />
                <div className="avatar avatar-sm" />
                <div className="avatar avatar-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
