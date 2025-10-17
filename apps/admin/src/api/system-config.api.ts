/**
 * System Config API Service
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  category: 'BOOKING' | 'DEPOSIT' | 'COMMISSION' | 'GENERAL';
  createdAt: string;
  updatedAt: string;
}

export const systemConfigApi = {
  /**
   * Get all system configs
   */
  getAll: async (params?: {
    category?: string;
  }): Promise<SystemConfig[]> => {
    return apiRequest<SystemConfig[]>({
      method: 'GET',
      url: API_ENDPOINTS.SYSTEM_CONFIG.BASE,
      params,
    });
  },

  /**
   * Get system config by ID
   */
  getById: async (id: string): Promise<SystemConfig> => {
    return apiRequest<SystemConfig>({
      method: 'GET',
      url: API_ENDPOINTS.SYSTEM_CONFIG.BY_ID(id),
    });
  },

  /**
   * Update system config (Admin only)
   */
  update: async (id: string, data: { value: string }): Promise<SystemConfig> => {
    return apiRequest<SystemConfig>({
      method: 'PATCH',
      url: API_ENDPOINTS.SYSTEM_CONFIG.BY_ID(id),
      data,
    });
  },
};

