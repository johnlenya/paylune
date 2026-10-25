import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return null;
    }
    try {
      const data = await api('/me');
      setUser(data.user);
      return data.user;
    } catch (error) {
      if (error.status === 401) {
        clearToken();
        setUser(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!getToken()) {
        if (active) setReady(true);
        return;
      }
      try {
        const data = await api('/me');
        if (active) setUser(data.user);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setReady(true);
      }
    }

    bootstrap();

    const handleSessionExpired = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener('paylune:session-expired', handleSessionExpired);
    return () => {
      active = false;
      window.removeEventListener('paylune:session-expired', handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const demoLogin = useCallback(async () => {
    const data = await api('/auth/demo', { method: 'POST' });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      signup,
      demoLogin,
      logout,
      refreshUser,
      updateUser: setUser,
    }),
    [user, ready, login, signup, demoLogin, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
