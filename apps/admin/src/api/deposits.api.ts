/**
 * Deposits API Service
 */

import { apiRequest } from './client';
import type { Deposit } from '../types/deposit.types';

export const depositsApi = {
  /**
   * Get all deposits
   */
  getAll: async (params?: {
    status?: string;
    projectId?: string;
  }): Promise<Deposit[]> => {
    return apiRequest<Deposit[]>({
      method: 'GET',
      url: '/deposits',
      params,
    });
  },

  /**
   * Approve deposit (CRITICAL - triggers payment schedule + commission)
   */
  approve: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'PATCH',
      url: `/deposits/${id}/approve`,
    });
  },

  /**
   * Get trash deposits (CANCELLED / OVERDUE still locking units)
   */
  getTrash: async (): Promise<Deposit[]> => {
    return apiRequest<Deposit[]>({
      method: 'GET',
      url: '/deposits/trash',
    });
  },

  /**
   * Cleanup deposit: release unit back to AVAILABLE
   */
  cleanup: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'PATCH',
      url: `/deposits/${id}/cleanup`,
    });
  },
};

