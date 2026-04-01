"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AuthPage } from '@/components/ui/auth-page';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const password = formData.get('password') as string;
    const password_confirm = formData.get('password_confirm') as string;

    if (password !== password_confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/register/', {
        username,
        email,
        first_name,
        last_name,
        password,
        password_confirm
      });

      // Auto-login after successful registration
      login(response.data.access, response.data.refresh, response.data.user);
      toast.success("Account created successfully!");
    } catch (error: any) {
      const errData = error.response?.data;
      if (errData && typeof errData === 'object' && !errData.detail) {
        Object.keys(errData).forEach(key => {
          const msg = Array.isArray(errData[key]) ? errData[key][0] : errData[key];
          toast.error(`${key}: ${msg}`);
        });
      } else {
        toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      mode="register"
      onSubmit={handleRegister}
      isLoading={isLoading}
      heroImageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=2160&q=80" // Portfolio/Growth theme
    />
  );
}
