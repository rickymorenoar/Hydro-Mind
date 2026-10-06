'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types/hydromind';
import { login as apiLogin, logout as apiLogout, getMe } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session from localStorage on initial client render
  useEffect(() => {
    const savedToken = localStorage.getItem('hydromind_token');
    const savedUser = localStorage.getItem('hydromind_user');

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore parsing error
        }
      }

      // Verify token with backend /me endpoint
      getMe()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('hydromind_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token invalid or expired
          localStorage.removeItem('hydromind_token');
          localStorage.removeItem('hydromind_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('hydromind_token', res.token);
        localStorage.setItem('hydromind_user', JSON.stringify(res.user));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout().catch(() => {});
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('hydromind_token');
      localStorage.removeItem('hydromind_user');
      router.push('/login');
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
