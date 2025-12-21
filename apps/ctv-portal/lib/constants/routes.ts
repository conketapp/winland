/**
 * Route Constants
 * Centralized route definitions for lazy loading
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROJECTS: '/project-management',
  RESERVATIONS: '/planning-area',
  COMMISSIONS: '/commissions',
  TRANSACTIONS: '/my-transactions',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notification',
} as const;

/**
 * Lazy load components for code splitting
 */
export const lazyRoutes = {
  Dashboard: () => import('@/app/dashboard/page'),
  Projects: () => import('@/app/project-management/page'),
  Reservations: () => import('@/app/planning-area/page'),
  Commissions: () => import('@/app/commissions/page'),
  Transactions: () => import('@/app/my-transactions/page'),
  Profile: () => import('@/app/profile/page'),
  Notifications: () => import('@/app/notification/page'),
};

