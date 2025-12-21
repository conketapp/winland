/**
 * Units API Service
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Unit, BulkImportUnitsDto, BulkImportResult, PaginatedResponse } from '../types/unit.types';

// Type for creating a unit (matches backend DTO)
export interface CreateUnitInput {
  projectId: string;
  buildingId: string;
  floorId: string;
  unitNumber: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  direction?: string;
  view?: string;
  balcony?: boolean;
  description?: string;
  commissionRate?: number;
  unitTypeId?: string;
  status?: Unit['status'];
}

// Type for updating a unit (only mutable fields)
export type UpdateUnitInput = Partial<Pick<Unit, 
  'price' | 'area' | 'bedrooms' | 'bathrooms' | 'direction' | 'view' | 
  'balcony' | 'description' | 'commissionRate' | 'unitTypeId' | 'status'
>>;

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
   * Get all units with pagination
   */
  getAll: async (params?: {
    projectId?: string;
    buildingId?: string;
    floorId?: string;
    status?: string;
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    bedrooms?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    hasReservation?: 'all' | 'has' | 'empty';
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Unit> | Unit[]> => {
    // Backend may return array (old) or PaginatedResponse (new)
    return apiRequest<PaginatedResponse<Unit> | Unit[]>({
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
  create: async (data: CreateUnitInput): Promise<Unit> => {
    return apiRequest<Unit>({
      method: 'POST',
      url: API_ENDPOINTS.UNITS.BASE,
      data,
    });
  },

  /**
   * Update unit
   */
  update: async (id: string, data: UpdateUnitInput): Promise<Unit> => {
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

