'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getRouteRule } from '@/lib/routeAccess';
import { getCurrentUser } from '@/features/auth/services/authService';

const AuthContext = createContext({
  user: null,
  loading: true,
  can: () => false,
  canPath: () => false,
  refresh: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastRefresh = useRef(0);

  const refresh = useCallback(async () => {
    lastRefresh.current = Date.now();
    try {
      setUser(await getCurrentUser());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Route change par auth API dobara call nahi karte; focus aur timed refresh se session fresh rahega.
  useEffect(() => {
    void refresh();
    const refreshIfStale = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefresh.current > 30_000) void refresh();
    };
    const timer = window.setInterval(refreshIfStale, 60_000);
    window.addEventListener('focus', refreshIfStale);
    document.addEventListener('visibilitychange', refreshIfStale);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshIfStale);
      document.removeEventListener('visibilitychange', refreshIfStale);
    };
  }, [refresh]);

  // can('prod', 'add')  |  can('Sales Report')
  const can = (key, action) => {
    if (!user) return false;
    if (user.isAdmin) return true;
    const p = user.permissions?.[key];
    return action ? p?.[action] === true : p === true;
  };

  const canPath = (path) => {
    if (!user) return false;
    const rule = getRouteRule(path);
    if (!rule) return true; // rule nahi = sirf login chahiye (jaise Dashboard)
    return rule.admin ? user.isAdmin : can(rule.key, rule.action);
  };

  return (
    <AuthContext.Provider value={{ user, loading, can, canPath, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
