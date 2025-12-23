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

export enum AnalyticsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum AnalyticsTimeRange {
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
  LAST_90_DAYS = '90d',
  LAST_6_MONTHS = '6m',
  LAST_YEAR = '1y',
  CUSTOM = 'custom',
}

export interface RevenueAnalytics {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    period: AnalyticsPeriod;
    dateRange: { start: Date; end: Date };
  };
  trend: Array<{
    period: string;
    revenue: number;
    transactions: number;
    projects: number;
  }>;
  projectComparison: Array<{
    projectId: string;
    projectName: string;
    revenue: number;
    transactions: number;
    percentage: number;
  }>;
  forecast: Array<{
    period: string;
    predicted: number;
  }>;
}

export interface CtvPerformanceMetrics {
  reservations: number;
  bookings: number;
  deposits: number;
  sold: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRates: {
    reservationToBooking: number;
    bookingToDeposit: number;
    reservationToSold: number;
  };
  averageDealTime: number;
}

export interface CtvPerformanceAnalytics {
  summary: {
    totalCtv: number;
    dateRange: { start: Date; end: Date };
  };
  performance: Array<{
    ctvId: string;
    ctvName: string;
    phone: string | null;
    metrics: CtvPerformanceMetrics;
  }>;
  rankings: {
    byDeals: Array<{ rank: number; ctvId: string; ctvName: string; metrics: CtvPerformanceMetrics }>;
    byRevenue: Array<{ rank: number; ctvId: string; ctvName: string; metrics: CtvPerformanceMetrics }>;
    byCommission: Array<{ rank: number; ctvId: string; ctvName: string; metrics: CtvPerformanceMetrics }>;
    byConversion: Array<{ rank: number; ctvId: string; ctvName: string; metrics: CtvPerformanceMetrics }>;
  };
  activityHeatmap: Array<{
    day: number;
    dayName: string;
    count: number;
  }>;
}

export interface ProjectPerformanceMetrics {
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  depositedUnits: number;
  soldUnits: number;
  salesRate: number;
  totalRevenue: number;
  totalTransactions: number;
  averageSellingTime: number;
  priceAnalysis: {
    highest: number;
    lowest: number;
    average: number;
  };
}

export interface ProjectPerformanceAnalytics {
  summary: {
    totalProjects: number;
    dateRange: { start: Date; end: Date };
  };
  performance: Array<{
    projectId: string;
    projectName: string;
    projectCode: string;
    metrics: ProjectPerformanceMetrics;
  }>;
  sortedBySalesRate: Array<{
    rank: number;
    projectId: string;
    projectName: string;
    projectCode: string;
    metrics: ProjectPerformanceMetrics;
  }>;
}

export interface AnalyticsQueryParams {
  period?: AnalyticsPeriod;
  timeRange?: AnalyticsTimeRange;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  ctvId?: string;
}

export const dashboardApi = {
  getAdminStats: async (): Promise<AdminDashboardStats> => {
    return apiRequest<AdminDashboardStats>({
      method: 'GET',
      url: '/dashboard/admin-stats',
    });
  },

  getRevenueAnalytics: async (params?: AnalyticsQueryParams): Promise<RevenueAnalytics> => {
    return apiRequest<RevenueAnalytics>({
      method: 'GET',
      url: '/dashboard/analytics/revenue',
      params,
    });
  },

  getCtvPerformanceAnalytics: async (params?: AnalyticsQueryParams): Promise<CtvPerformanceAnalytics> => {
    return apiRequest<CtvPerformanceAnalytics>({
      method: 'GET',
      url: '/dashboard/analytics/ctv-performance',
      params,
    });
  },

  getProjectPerformanceAnalytics: async (params?: AnalyticsQueryParams): Promise<ProjectPerformanceAnalytics> => {
    return apiRequest<ProjectPerformanceAnalytics>({
      method: 'GET',
      url: '/dashboard/analytics/project-performance',
      params,
    });
  },
};
