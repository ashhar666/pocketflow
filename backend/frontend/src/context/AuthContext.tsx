'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { PUBLIC_ROUTES } from '../lib/constants';

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
      } catch (error: any) {
        // Only log if it's not a standard 401 (which is expected for guests)
        if (error.response?.status !== 401) {
          console.error('[AUTH] Profile fetch failed:', error);
        }
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
    if (!authInitialized.current) {
      console.log('[AUTH] Waiting for initialization...');
      return;
    }
    if (isLoading) {
      console.log('[AUTH] Still loading profile...');
      return;
    }

    // Standardize pathname for comparison (handle potential null/undefined and trailing slashes)
    const currentPath = (pathname || '/').replace(/\/$/, '') || '/';

    if (isAuthenticated) {
      // If authenticated and on login/register → send to dashboard
      if (currentPath === '/login' || currentPath === '/register') {
        console.info(`[AUTH] Authenticated user on ${currentPath}. Redirecting to /dashboard`);
        router.push('/dashboard');
      }
      return;
    }

    // If NOT authenticated
    // Check if it's a public route
    const isPublic = PUBLIC_ROUTES.includes(currentPath);
    
    if (isPublic) {
      console.info(`[AUTH] Guest on public route: ${currentPath}. Access allowed.`);
      return;
    }

    // Otherwise → redirect to login
    console.warn(`[AUTH] Unauthorized access to ${currentPath}. Redirecting to /login`);
    router.push('/login');
  }, [pathname, isAuthenticated, isLoading, router]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    toast.success('Welcome!');
    router.push('/dashboard');
  };

  // ── Logout ────────────────────────────────────────────────────────────────
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
