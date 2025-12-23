/**
 * Transactions API Service
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';

export interface Transaction {
  id: string;
  depositId: string;
  paymentScheduleId?: string | null;
  amount: number;
  paymentMethod: string;
  paymentProof?: string | null;
  transactionRef?: string | null;
  paymentDate: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';
  confirmedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  deposit?: {
    id: string;
    code: string;
    customerName: string;
    customerPhone?: string | null;
    depositAmount: number;
    unit?: {
      id: string;
      code: string;
      project?: {
        id: string;
        name: string;
      } | null;
    } | null;
  } | null;
  paymentSchedule?: {
    id: string;
    installment: number;
    name: string;
    amount: number;
    dueDate?: string | null;
    status: string;
  } | null;
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
      method: 'PATCH',
      url: API_ENDPOINTS.TRANSACTIONS.CONFIRM(id),
    });
  },

  /**
   * Reject transaction (Admin only)
   */
  reject: async (id: string, reason: string): Promise<Transaction> => {
    return apiRequest<Transaction>({
      method: 'PATCH',
      url: API_ENDPOINTS.TRANSACTIONS.BY_ID(id) + '/reject',
      data: { reason },
    });
  },
};

