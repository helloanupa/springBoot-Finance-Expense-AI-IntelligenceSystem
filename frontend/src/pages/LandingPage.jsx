import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Brain, TrendingUp, Shield, BarChart3, MessageSquare,
  ArrowRight, Check, Star, Sparkles
} from 'lucide-react';

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
  },
  {
    icon: Sparkles,
    title: 'Smart Reports',
    desc: 'Auto-generated monthly financial reports with actionable insights',
    color: '#ec4899'
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
        style={{ background: 'rgba(10,15,30,0.8)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center pulse-glow">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">FinanceAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-xl transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}>
              Sign In
            </Link>
            <Link to="/register"
              className="btn-gradient px-4 py-2 text-sm font-semibold rounded-xl text-white">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-10 float-animation"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '-20%', left: '50%', transform: 'translateX(-50%)' }} />
          <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-8 float-animation"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '0', left: '10%', animationDelay: '2s' }} />
          <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-8 float-animation"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '0', right: '10%', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--accent-blue)' }}>
            <Sparkles size={14} />
            AI-Powered Financial Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Your Money,{' '}
            <span className="gradient-text">Intelligently</span>
            <br />Managed
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            AI Finance tracks your expenses, predicts spending, detects overspending, and provides
            personalized insights — all powered by advanced AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register"
              className="btn-gradient px-8 py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 group">
              Start for Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all hover:border-indigo-500/50"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
              Sign In
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
            No credit card required • Free to use • Secure & encrypted
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center">
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">{value}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything you need to master your finances
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Built with cutting-edge AI to give you insights that traditional finance apps can't provide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card gradient-border p-10">
            <Zap size={40} className="mx-auto mb-6 pulse-glow" style={{ color: 'var(--accent-blue)' }} />
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to take control of your finances?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of users getting AI-powered financial insights every day.
            </p>
            <Link to="/register"
              className="btn-gradient px-8 py-4 rounded-xl font-bold text-white text-lg inline-flex items-center gap-2">
              Get Started for Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={16} style={{ color: 'var(--accent-blue)' }} />
          <span className="font-bold gradient-text">FinanceAI</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © 2025 FinanceAI. Built with ❤️ and AI
        </p>
      </footer>
    </div>
  );
}
