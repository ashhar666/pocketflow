"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api, { buildApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { AuthPage } from '@/components/ui/auth-page';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  // Redirect authenticated users — staff go to /admin, others to /dashboard
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(user?.is_staff ? '/admin' : '/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login/', { email, password });
      login(response.data.user);
      // AuthContext.login() handles the redirect (staff → /admin, user → /dashboard)
    } catch (error: any) {
      console.error("Login Error:", error.response?.data || error.message);
      const detailMsg = error.response?.data?.detail;
      toast.error(detailMsg || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = buildApiUrl('/auth/google/login/');
  };

  return (
    <AuthPage
      mode="login"
      onSubmit={handleLogin}
      onGoogleClick={handleGoogleLogin}
      isLoading={isLoading}
      isGoogleLoading={isLoading}
      heroImageSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=2160&q=80"
    />
  );
}
