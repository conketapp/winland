/**
 * Authentication Context
 * Clean, type-safe authentication state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { User, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verify token is still valid
          const currentUser = await authApi.getMe();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.loginAdmin({ email, password });
      
      setUser(response.user);
      setToken(response.accessToken);
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
