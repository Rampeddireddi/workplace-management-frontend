import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (active) {
          setUser(res.data.user);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchAccounts = async () => {
      try {
        const res = await apiClient.get('/auth/demo-accounts');
        if (active) {
          setDemoAccounts(res.data.accounts || []);
        }
      } catch {
        if (active) {
          setDemoAccounts([]);
        }
      }
    };

    fetchAccounts();

    return () => {
      active = false;
    };
  }, []);

  const login = async (employeeId, password) => {
    const res = await apiClient.post('/auth/login', { employeeId, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    demoAccounts,
    login,
    logout,
  }), [user, loading, demoAccounts]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
