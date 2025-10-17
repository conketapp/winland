/**
 * Authentication Types
 * Type definitions for auth-related data
 */

export interface LoginAdminDto {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  avatar?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CTV' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

