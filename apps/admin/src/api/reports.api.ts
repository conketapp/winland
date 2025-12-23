import { apiRequest } from './client';

// --- Sales report ---

export type SalesGroupBy = 'project' | 'ctv';

export interface SalesReportSummary {
  totalDeals: number;
  totalRevenue: number;
  from: string;
  to: string;
  groupBy: SalesGroupBy;
}

export interface SalesReportItem {
  key: string;
  label: string;
  deals: number;
  revenue: number;
}

export interface SalesReportRow {
  id: string;
  code: string;
  projectName?: string;
  projectCode?: string;
  unitCode?: string;
  ctvName?: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface SalesReportResponse {
  summary: SalesReportSummary;
  items: SalesReportItem[];
  raw: SalesReportRow[];
}

export interface SalesReportQuery {
  from?: string;
  to?: string;
  projectId?: string;
  ctvId?: string;
  status?: string;
  groupBy?: SalesGroupBy;
}

// --- Commission report ---

export type CommissionGroupBy = 'CTV' | 'PROJECT';

export interface CommissionSummary {
  totalAmount: number;
  totalCount: number;
  byStatus: {
    PENDING: number;
    APPROVED: number;
    PAID: number;
  };
  from: string;
  to: string;
}

export interface CommissionRankingRow {
  key: string;
  label: string;
  amount: number;
  count: number;
  pending: number;
  approved: number;
  paid: number;
}

export interface CommissionReportResponse {
  summary: CommissionSummary;
  rankings: CommissionRankingRow[];
  raw: any[];
}

export interface CommissionReportQuery {
  from?: string;
  to?: string;
  ctvId?: string;
  projectId?: string;
  status?: 'PENDING' | 'APPROVED' | 'PAID';
  groupBy?: CommissionGroupBy;
}

// --- Transaction report ---

export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  byStatus: {
    PENDING_CONFIRMATION: number;
    CONFIRMED: number;
    CANCELLED: number;
  };
  from: string;
  to: string;
}

export interface CashFlowPoint {
  date: string;
  total: number;
  count: number;
}

export interface TransactionRow {
  id: string;
  amount: number;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';
  paymentDate: string;
  projectName?: string;
  projectCode?: string;
  unitCode?: string;
  depositCode?: string;
}

export interface TransactionReportResponse {
  summary: TransactionSummary;
  cashFlow: CashFlowPoint[];
  raw: TransactionRow[];
}

export interface TransactionReportQuery {
  from?: string;
  to?: string;
  status?: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';
}

// --- Inventory report ---

export type UnitStatusType = 'AVAILABLE' | 'RESERVED_BOOKING' | 'DEPOSITED' | 'SOLD';

export interface InventorySummary {
  totalUnits: number;
  statusCounts: Record<UnitStatusType, number>;
}

export interface InventoryProjectRow {
  projectId: string;
  projectName: string;
  projectCode: string;
  total: number;
  available: number;
  reserved: number;
  deposited: number;
  sold: number;
}

export interface InventoryReportResponse {
  summary: InventorySummary;
  projects: InventoryProjectRow[];
}

export interface InventoryReportQuery {
  projectId?: string;
}

export const reportsApi = {
  getSalesReport: async (params?: SalesReportQuery): Promise<SalesReportResponse> => {
    return apiRequest<SalesReportResponse>({
      method: 'GET',
      url: '/reports/sales',
      params,
    });
  },

  getCommissionReport: async (
    params?: CommissionReportQuery,
  ): Promise<CommissionReportResponse> => {
    return apiRequest<CommissionReportResponse>({
      method: 'GET',
      url: '/reports/commissions',
      params,
    });
  },

  getTransactionReport: async (
    params?: TransactionReportQuery,
  ): Promise<TransactionReportResponse> => {
    return apiRequest<TransactionReportResponse>({
      method: 'GET',
      url: '/reports/transactions',
      params,
    });
  },

  getInventoryReport: async (
    params?: InventoryReportQuery,
  ): Promise<InventoryReportResponse> => {
    return apiRequest<InventoryReportResponse>({
      method: 'GET',
      url: '/reports/inventory',
      params,
    });
  },
};

