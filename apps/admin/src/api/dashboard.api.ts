/**
 * Dashboard API - dùng endpoint tổng hợp từ backend
 */

import { apiRequest } from './client';

export interface AdminDashboardStats {
  projects: {
    total: number;
    upcoming: number;
    open: number;
    closed: number;
  };
  units: {
    total: number;
    available: number;
    reserved: number;
    deposited: number;
    sold: number;
  };
  pending: {
    bookings: number;
    deposits: number;
    transactions: number;
    paymentRequests: number;
  };
  revenue: {
    totalRevenue: number;
    totalTransactions: number;
  };
  funnel: {
    reservations: {
      total: number;
      active: number;
      yourTurn: number;
      expiredOrMissed?: number;
    };
    bookings: {
      total: number;
      confirmed: number;
    };
    deposits: {
      total: number;
      confirmed: number;
      cancelled?: number;
      overdue?: number;
    };
    conversionRates: {
      reservationToBooking: number;
      reservationToDeposit: number;
    };
  };
  risks?: {
    overdueSchedules: number;
    overdueDeposits: number;
    reservations: {
      yourTurn: number;
      expiredOrMissed: number;
    };
  };
}

export const dashboardApi = {
  getAdminStats: async (): Promise<AdminDashboardStats> => {
    return apiRequest<AdminDashboardStats>({
      method: 'GET',
      url: '/dashboard/admin-stats',
    });
  },
};


