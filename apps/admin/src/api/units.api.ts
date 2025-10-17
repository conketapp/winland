/**
 * Units API Service
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Unit, BulkImportUnitsDto, BulkImportResult } from '../types/unit.types';

export const unitsApi = {
  /**
   * Bulk import units (CRITICAL FEATURE)
   */
  bulkImport: async (data: BulkImportUnitsDto): Promise<BulkImportResult> => {
    return apiRequest<BulkImportResult>({
      method: 'POST',
      url: API_ENDPOINTS.UNITS.BULK_IMPORT,
      data,
    });
  },

  /**
   * Get all units
   */
  getAll: async (params?: {
    projectId?: string;
    buildingId?: string;
    status?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<Unit[]> => {
    return apiRequest<Unit[]>({
      method: 'GET',
      url: API_ENDPOINTS.UNITS.BASE,
      params,
    });
  },

  /**
   * Get unit by ID
   */
  getById: async (id: string): Promise<Unit> => {
    return apiRequest<Unit>({
      method: 'GET',
      url: API_ENDPOINTS.UNITS.BY_ID(id),
    });
  },

  /**
   * Create single unit
   */
  create: async (data: Partial<Unit>): Promise<Unit> => {
    return apiRequest<Unit>({
      method: 'POST',
      url: API_ENDPOINTS.UNITS.BASE,
      data,
    });
  },

  /**
   * Update unit
   */
  update: async (id: string, data: Partial<Unit>): Promise<Unit> => {
    return apiRequest<Unit>({
      method: 'PATCH',
      url: API_ENDPOINTS.UNITS.BY_ID(id),
      data,
    });
  },

  /**
   * Delete unit
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'DELETE',
      url: API_ENDPOINTS.UNITS.BY_ID(id),
    });
  },
};

