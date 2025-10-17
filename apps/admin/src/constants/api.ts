/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN_ADMIN: '/auth/login-admin',
    LOGIN_CTV: '/auth/login-ctv',
    ME: '/auth/me',
  },
  // Projects
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    STATUS: (id: string) => `/projects/${id}/status`,
    STATISTICS: (id: string) => `/projects/${id}/statistics`,
  },
  // Units
  UNITS: {
    BASE: '/units',
    BULK_IMPORT: '/units/bulk-import',
    BY_ID: (id: string) => `/units/${id}`,
  },
  // Unit Types
  UNIT_TYPES: {
    BASE: '/unit-types',
    BY_ID: (id: string) => `/unit-types/${id}`,
  },
  // Reservations
  RESERVATIONS: {
    BASE: '/reservations',
    BY_ID: (id: string) => `/reservations/${id}`,
  },
  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    APPROVE: (id: string) => `/bookings/${id}/approve`,
    REJECT: (id: string) => `/bookings/${id}/reject`,
  },
  // Deposits
  DEPOSITS: {
    BASE: '/deposits',
    BY_ID: (id: string) => `/deposits/${id}`,
    APPROVE: (id: string) => `/deposits/${id}/approve`,
    REJECT: (id: string) => `/deposits/${id}/reject`,
  },
  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id: string) => `/transactions/${id}`,
    CONFIRM: (id: string) => `/transactions/${id}/confirm`,
  },
  // Payment Requests
  PAYMENT_REQUESTS: {
    BASE: '/payment-requests',
    BY_ID: (id: string) => `/payment-requests/${id}`,
    APPROVE: (id: string) => `/payment-requests/${id}/approve`,
    REJECT: (id: string) => `/payment-requests/${id}/reject`,
    MARK_PAID: (id: string) => `/payment-requests/${id}/mark-paid`,
  },
  // System Config
  SYSTEM_CONFIG: {
    BASE: '/system-config',
    BY_ID: (id: string) => `/system-config/${id}`,
  },
  // Users (Admin management)
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  // Amenities
  AMENITIES: {
    BASE: '/amenities',
    BY_ID: (id: string) => `/amenities/${id}`,
  },
} as const;

