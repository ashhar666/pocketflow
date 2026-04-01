'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from '../lib/api';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

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
  login: (access: string, refresh: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => { },
  logout: () => { },
  checkAuth: () => { },
});

const publicRoutes = ['/login', '/register', '/'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleUnauthenticated = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    if (!publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [pathname, router]);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');

      if (!token) {
        if (refreshToken) {
          try {
            // Attempt a silent refresh if access token is missing but refresh token exists
            const { data } = await api.post('/auth/token/refresh/', {
              refresh: refreshToken
            });
            const newAccessToken = data.access;
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            Cookies.set('access_token', newAccessToken, { secure: !isLocal, sameSite: 'strict', expires: 1 / 24 });
            // Successfully refreshed, now fetch profile
          } catch (refreshError) {
            console.error('Silent refresh failed', refreshError);
            handleUnauthenticated();
            return;
          }
        } else {
          handleUnauthenticated();
          return;
        }
      }

      const response = await api.get('/auth/profile/');
      setUser(response.data);
      setIsAuthenticated(true);

      if (publicRoutes.includes(pathname)) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth verification failed', error);
      handleUnauthenticated();
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthenticated, pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (access: string, refresh: string, userData: User) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    Cookies.set('access_token', access, { secure: !isLocal, sameSite: 'strict', expires: 1 / 24 }); // 1 hour
    Cookies.set('refresh_token', refresh, { secure: !isLocal, sameSite: 'strict', expires: 7 }); // 7 days

    setUser(userData);
    setIsAuthenticated(true);
    toast.success(`Welcome back!`);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      const refresh = Cookies.get('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (error) {
      console.error('Logout failed on the backend', error);
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
