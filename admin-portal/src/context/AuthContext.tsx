import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Admin } from '../types';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    const a = localStorage.getItem('admin_user');
    if (t && a) { setToken(t); setAdmin(JSON.parse(a)); }
  }, []);

  const login = (t: string, a: Admin) => {
    localStorage.setItem('admin_token', t);
    localStorage.setItem('admin_user', JSON.stringify(a));
    setToken(t); setAdmin(a);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null); setAdmin(null);
  };

  return <AuthContext.Provider value={{ admin, token, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
