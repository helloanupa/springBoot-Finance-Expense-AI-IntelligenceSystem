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
    <div className="auth-page">
      <div className="auth-card auth-card-split">
        <div className="auth-form-panel auth-form-panel-yellow">
          <div className="auth-brand">
            <div className="brand-pill">FinanceAI</div>
          </div>

          <div className="auth-copy">
            <h1>Welcome back</h1>
            <p>Sign in to your account and continue managing your finances with AI support.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              <span>Email</span>
              <input
                type="email"
                className="auth-input"
                placeholder="amelielaurent7622@gmail.com"
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

            <button type="submit" disabled={loading} className="auth-submit auth-submit-yellow">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="social-buttons">
            <button className="auth-social auth-social-light"><span></span> Apple</button>
            <button className="auth-social auth-social-light"><span>G</span> Google</button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>

        <div className="auth-visual-panel">
          <div className="hero-content">
            <div className="hero-pill">Task Review With Team</div>
            <div className="hero-title">Collaborate smarter with real-time insights.</div>
            <div className="hero-subtitle">Keep your team aligned, budgets in sync, and meetings productive.</div>
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
