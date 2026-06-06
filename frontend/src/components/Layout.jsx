import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden app-root">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div style={{ width: 'var(--sidebar-width)' }}>
          <Sidebar isOpen={true} setIsOpen={() => {}} />
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 flex-shrink-0 top-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Menu size={20} />
            </button>
            {/* Search bar */}
            <div className="hidden md:flex items-center gap-2 search-box">
              <Search size={16} />
              <span className="text-sm">Search transactions...</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}>
              <Bell size={18} />
              <span className="notification-dot absolute top-1.5 right-1.5" />
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-2 rounded-xl transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center text-white text-sm font-bold cursor-pointer">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full container mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
