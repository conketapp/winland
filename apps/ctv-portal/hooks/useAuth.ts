/**
 * Authentication Hook
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('ctv_token');
    localStorage.removeItem('ctv_user');
    setUser(null);
    router.push('/');
  }, [router]);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('ctv_token');
    const userData = localStorage.getItem('ctv_user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Failed to parse user data:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [router, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('ctv_token', token);
    localStorage.setItem('ctv_user', JSON.stringify(userData));
    setUser(userData);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

