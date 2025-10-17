/**
 * Transactions API Service
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';

export interface Transaction {
  id: string;
  depositId: string;
  paymentScheduleId: string;
  unitId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  proofImages?: string | null;
  transactionDate: string;
  status: 'PENDING_APPROVAL' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedReason?: string | null;
  notes?: string | null;
  createdAt: string;
  customer?: {
    fullName: string;
    phone: string;
  };
  unit?: {
    code: string;
    unitNumber: string;
  };
}

export const transactionsApi = {
  /**
   * Get all transactions
   */
  getAll: async (params?: {
    status?: string;
    depositId?: string;
    unitId?: string;
  }): Promise<Transaction[]> => {
    return apiRequest<Transaction[]>({
      method: 'GET',
      url: API_ENDPOINTS.TRANSACTIONS.BASE,
      params,
    });
  },

  /**
   * Get transaction by ID
   */
  getById: async (id: string): Promise<Transaction> => {
    return apiRequest<Transaction>({
      method: 'GET',
      url: API_ENDPOINTS.TRANSACTIONS.BY_ID(id),
    });
  },

  /**
   * Confirm transaction (Admin only)
   */
  confirm: async (id: string): Promise<Transaction> => {
    return apiRequest<Transaction>({
      method: 'POST',
      url: API_ENDPOINTS.TRANSACTIONS.CONFIRM(id),
    });
  },
};

