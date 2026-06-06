import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowUpDown, BarChart3, Brain,
  MessageSquare, Settings, LogOut, Zap, X, Menu, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowUpDown, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/insights', icon: Brain, label: 'AI Insights' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="sidebar fixed left-0 top-0 h-full z-50 flex flex-col lg:relative lg:translate-x-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center pulse-glow">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm gradient-text">FinanceAI</span>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pro Dashboard</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? 'active' : ''
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                  {label}
                  {label === 'AI Insights' && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--accent-blue)' }}>
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="glass-card p-3 mb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full btn-gradient flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
            <TrendingUp size={14} style={{ color: 'var(--accent-green)' }} />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10"
            style={{ color: 'var(--accent-red)' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}
