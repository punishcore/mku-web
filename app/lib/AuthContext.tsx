'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';

interface User {
  username: string;
  nama: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) as User : null;
    setUser(parsed);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = useMemo(() => ({ user, login, logout, isLoading }), [user, login, logout, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
