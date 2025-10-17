export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CTV = 'CTV',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
}

