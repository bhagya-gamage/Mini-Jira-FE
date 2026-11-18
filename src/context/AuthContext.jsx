import { createContext, useCallback, useMemo, useState } from 'react';
import api, { storage } from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => storage.get());

  const save = useCallback((data) => { storage.set(data); setAuth(data); return data; }, []);

  const login = useCallback(async (email, password) =>
    save((await api.post('/auth/login', { email, password })).data), [save]);

  const register = useCallback(async (payload) =>
    save((await api.post('/auth/register', payload)).data), [save]);

  const logout = useCallback(() => { storage.clear(); setAuth(null); }, []);

  const value = useMemo(() => ({
    user: auth?.user ?? null,
    isAuthenticated: !!auth?.accessToken,
    isManager: ['ADMIN', 'PROJECT_MANAGER'].includes(auth?.user?.role),
    login, register, logout,
  }), [auth, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
