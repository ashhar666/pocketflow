"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AuthPage } from '@/components/ui/auth-page';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

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
      login(response.data.access, response.data.refresh, response.data.user);
    } catch (error: any) {
      console.error("Login Error:", error.response?.data || error.message);
      const detailMsg = error.response?.data?.detail;
      toast.error(detailMsg || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      mode="login"
      onSubmit={handleLogin}
      isLoading={isLoading}
      heroImageSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=2160&q=80" // Coins/Growth theme
    />
  );
}
