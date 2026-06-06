import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Brain, TrendingUp, Shield, BarChart3, MessageSquare,
  ArrowRight, Sparkles
} from 'lucide-react';
import Footer from '../components/Footer';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    desc: 'Get intelligent analysis of your spending patterns and personalized recommendations',
    color: '#6366f1'
  },
  {
    icon: TrendingUp,
    title: 'Spending Predictions',
    desc: 'AI predicts your next month spending based on historical data and trends',
    color: '#10b981'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    desc: 'Beautiful charts and graphs showing your complete financial picture',
    color: '#06b6d4'
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Advisor',
    desc: 'Ask your personal AI financial advisor anything about your money',
    color: '#8b5cf6'
  },
  {
    icon: Shield,
    title: 'Overspending Alerts',
    desc: 'Real-time detection of abnormal spending patterns and budget warnings',
    color: '#f59e0b'
  }
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '$2M+', label: 'Tracked Monthly' },
  { value: '4.9★', label: 'User Rating' }
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <span className="brand-pill">FinanceAI</span>
        </div>

        <nav className="landing-menu">
          <a href="#freelancers">Freelancers</a>
          <a href="#business">Business</a>
          <a href="#marketplace">Marketplace</a>
        </nav>

        <div className="landing-actions">
          <Link to="/login" className="link-secondary">Sign In</Link>
          <Link to="/register" className="btn-primary">Sign Up</Link>
        </div>
      </header>

      <main className="landing-hero-section">
        <div className="landing-hero-card">
          <div className="landing-hero-copy">
            <span className="landing-badge">Create an account</span>
            <h1>Manage your money</h1>
            <p>Track spending, schedule payments, and visualize your cash flow with a beautifully designed finance dashboard.</p>

            <div className="landing-hero-buttons">
              <button className="app-store-btn apple">
                <span>App Store</span>
              </button>
              <button className="app-store-btn google">
                <span>Google Play</span>
              </button>
            </div>

            <div className="landing-hero-note">
              Free for 30 days • No credit card required
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="visual-card visual-card-photo" />

            <div className="visual-floating floating-top-left">
              <div className="floating-label">Paid to Starbucks</div>
              <div className="floating-value">850.00 EUR</div>
              <div className="floating-time">10:45 AM</div>
            </div>

            <div className="visual-floating floating-top-right">
              <div className="floating-label">Paid to Starbucks</div>
              <div className="floating-value">1,590.00 EUR</div>
              <div className="floating-time">10:45 AM</div>
            </div>

            <div className="visual-floating floating-bottom-left">
              <div className="floating-label">Sent to Rüdiger</div>
              <div className="floating-value">2,000.00 EUR</div>
              <div className="floating-time">10:45 AM</div>
            </div>

            <div className="visual-schedule-card">
              <div className="schedule-tag">Daily Meeting</div>
              <div className="schedule-time">12:00pm - 01:00pm</div>
              <div className="schedule-avatars">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="landing-stats-section">
        <div className="landing-stats-grid">
          {stats.map(({ value, label }) => (
            <div key={label} className="landing-stat-card">
              <p className="landing-stat-value">{value}</p>
              <p className="landing-stat-label">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-features-section" id="business">
        <div className="landing-section-heading">
          <h2>Everything you need to master your finances</h2>
          <p>Built with powerful AI to help you budget better, stay on track, and grow your savings.</p>
        </div>

        <div className="landing-features-grid">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon" style={{ background: `${color}22`, color }}>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <Zap size={32} className="cta-icon" />
          <div>
            <h3>Ready to take control of your finances?</h3>
            <p>Join thousands of users getting smarter with their money every day.</p>
          </div>
          <Link to="/register" className="btn-primary btn-cta">Get Started</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
