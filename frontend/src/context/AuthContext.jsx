import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('finance_token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('finance_token');
      const storedUser = localStorage.getItem('finance_user');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const data = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('finance_user', JSON.stringify(data.user));
        } catch {
          localStorage.removeItem('finance_token');
          localStorage.removeItem('finance_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('finance_token', data.token);
    localStorage.setItem('finance_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('finance_token', data.token);
    localStorage.setItem('finance_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('finance_token');
    localStorage.removeItem('finance_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('finance_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
