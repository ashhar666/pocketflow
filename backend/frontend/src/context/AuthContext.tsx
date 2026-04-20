'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Pages that do NOT require authentication.
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => { },
  logout: () => { },
  updateUser: () => { },
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Track whether the initial auth check has completed.
  const authInitialized = useRef(false);

  // ── Initial auth check (runs ONCE on mount) ────────────────────────────────
  useEffect(() => {
    if (authInitialized.current) return;

    const runCheck = async () => {
      setIsLoading(true);
      try {
        // Backend sets HTTP-only cookies automatically.
        // Just fetch profile — if cookies exist, the request is authenticated.
        const { data } = await api.get('/auth/profile/');
        setUser(data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        authInitialized.current = true;
      }
    };

    runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation guard (runs AFTER auth is initialized) ──────────────────────
  useEffect(() => {
    if (!authInitialized.current) return;
    if (isLoading) return;

    if (isAuthenticated) {
      if (pathname === '/login' || pathname === '/register') {
        router.push('/dashboard');
      }
      return;
    }

    if (PUBLIC_ROUTES.has(pathname)) return;

    router.push('/login');
  }, [pathname, isAuthenticated, isLoading, router]);

  // ── Login ─────────────────────────────────────────────────────────────────
  // Backend sets HTTP-only cookies automatically — we just store user state.
  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    toast.success('Welcome!');
    router.push('/dashboard');
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  // Backend clears HTTP-only cookies automatically.
  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout backend call failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  // ── Update User ──────────────────────────────────────────────────────────
  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
