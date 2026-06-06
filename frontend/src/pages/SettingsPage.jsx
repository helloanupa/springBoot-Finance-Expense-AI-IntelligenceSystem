import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Brain, DollarSign, Save,
  Sun, Moon, Shield, ChevronRight, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CATEGORY_BUDGET_FIELDS = [
  { key: 'food', label: 'Food & Dining', emoji: '🍔' },
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { key: 'health', label: 'Health', emoji: '💊' },
  { key: 'utilities', label: 'Utilities', emoji: '💡' },
  { key: 'education', label: 'Education', emoji: '📚' },
  { key: 'other', label: 'Other', emoji: '📦' }
];

function SettingsSection({ title, children }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    monthlyBudget: user?.monthlyBudget || 5000,
    currency: user?.currency || 'USD'
  });

  const [categoryBudgets, setCategoryBudgets] = useState(user?.categoryBudgets || {
    food: 500, transport: 200, entertainment: 300, shopping: 400,
    health: 200, utilities: 300, education: 200, other: 200
  });

  const [preferences, setPreferences] = useState(user?.preferences || {
    aiSensitivity: 'medium',
    notifications: true,
    weeklyReport: true
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = await api.put('/users/profile', { ...profile, categoryBudgets, preferences });
      updateUser(data.data);
      toast.success('Settings saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords don't match"); return;
    }
    setSaving(true);
    try {
      await api.put('/users/password', { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('Password changed!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', Icon: User },
    { id: 'budget', label: 'Budget', Icon: DollarSign },
    { id: 'appearance', label: 'Appearance', Icon: Palette },
    { id: 'ai', label: 'AI Settings', Icon: Brain },
    { id: 'security', label: 'Security', Icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Nav */}
        <div className="md:w-48 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left`}
              style={activeTab === id
                ? { background: 'rgba(99,102,241,0.15)', color: 'var(--accent-blue)', border: '1px solid rgba(99,102,241,0.3)' }
                : { color: 'var(--text-muted)', border: '1px solid transparent' }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            {activeTab === 'profile' && (
              <SettingsSection title="Profile Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                    <input className="input-field" value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <input className="input-field" type="email" value={profile.email} disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Monthly Budget ($)</label>
                    <input className="input-field" type="number" value={profile.monthlyBudget}
                      onChange={e => setProfile({ ...profile, monthlyBudget: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Currency</label>
                    <select className="input-field" value={profile.currency}
                      onChange={e => setProfile({ ...profile, currency: e.target.value })}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                </div>
              </SettingsSection>
            )}

            {activeTab === 'budget' && (
              <SettingsSection title="Category Budgets">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Set monthly spending limits per category. AI will alert you when you're close to the limit.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORY_BUDGET_FIELDS.map(({ key, label, emoji }) => (
                    <div key={key}>
                      <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        {emoji} {label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                        <input type="number" className="input-field pl-7"
                          value={categoryBudgets[key] || 0}
                          onChange={e => setCategoryBudgets({ ...categoryBudgets, [key]: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                  ))}
                </div>
              </SettingsSection>
            )}

            {activeTab === 'appearance' && (
              <SettingsSection title="Appearance">
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={18} style={{ color: 'var(--accent-blue)' }} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Toggle between dark and light theme</p>
                    </div>
                  </div>
                  <button onClick={toggleTheme}
                    className={`w-14 h-7 rounded-full transition-all relative`}
                    style={{ background: theme === 'dark' ? 'var(--accent-blue)' : '#e5e7eb' }}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow ${
                      theme === 'dark' ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </SettingsSection>
            )}

            {activeTab === 'ai' && (
              <SettingsSection title="AI Settings">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    AI Analysis Sensitivity
                  </label>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Higher sensitivity = more frequent alerts and detailed analysis
                  </p>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(level => (
                      <button key={level} onClick={() => setPreferences({ ...preferences, aiSensitivity: level })}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all border"
                        style={preferences.aiSensitivity === level
                          ? { background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', color: 'white' }
                          : { borderColor: 'var(--border-color)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { key: 'notifications', label: 'Smart Notifications', desc: 'Get alerts for overspending and milestones' },
                  { key: 'weeklyReport', label: 'Weekly AI Report', desc: 'Receive weekly financial summary via AI' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'var(--bg-secondary)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                    </div>
                    <button onClick={() => setPreferences({ ...preferences, [key]: !preferences[key] })}
                      className="w-11 h-6 rounded-full transition-all relative"
                      style={{ background: preferences[key] ? 'var(--accent-blue)' : '#4b5563' }}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences[key] ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </SettingsSection>
            )}

            {activeTab === 'security' && (
              <SettingsSection title="Change Password">
                <div className="space-y-4">
                  {[
                    { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                    { key: 'new', label: 'New Password', placeholder: 'Enter new password' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' }
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                      <input type="password" className="input-field" placeholder={placeholder}
                        value={passwords[key]} onChange={e => setPasswords({ ...passwords, [key]: e.target.value })} />
                    </div>
                  ))}
                  <button onClick={changePassword} disabled={saving || !passwords.current || !passwords.new}
                    className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold text-white w-full disabled:opacity-50">
                    Update Password
                  </button>
                </div>
              </SettingsSection>
            )}

            {/* Save button (not for security tab) */}
            {activeTab !== 'security' && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={saveProfile} disabled={saving}
                className="w-full btn-gradient py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70">
                {saved ? (
                  <><CheckCircle2 size={16} /> Saved!</>
                ) : saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Save Changes</>
                )}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
