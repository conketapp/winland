/**
 * Reservations API Client
 * Admin frontend API calls for managing reservations
 */

import { apiRequest } from './client';

export interface Reservation {
  id: string;
  code: string;
  unitId: string;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  status: 'ACTIVE' | 'YOUR_TURN' | 'MISSED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
  priority: number;
  reservedUntil: string;
  depositDeadline?: string;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  unit?: {
    id: string;
    code: string;
    unitNumber: string;
    price: number;
    area: number;
    project?: {
      id: string;
      name: string;
      code: string;
    };
    building?: {
      id: string;
      name: string;
      code: string;
    };
    floor?: {
      id: string;
      number: number;
    };
  };
  ctv?: {
    id: string;
    fullName: string;
    phone: string;
  };
}

export const reservationsApi = {
  /**
   * Get all reservations with filters
   */
  getAll: async (params?: { status?: string; projectId?: string }): Promise<Reservation[]> => {
    return apiRequest<Reservation[]>({
      method: 'GET',
      url: '/reservations',
      params,
    });
  },

  /**
   * Get reservation by ID
   */
  getById: async (id: string): Promise<Reservation> => {
    return apiRequest<Reservation>({
      method: 'GET',
      url: `/reservations/${id}`,
    });
  },

  /**
   * Cancel reservation
   */
  cancel: async (id: string, reason?: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'DELETE',
      url: `/reservations/${id}`,
      data: { reason },
    });
  },
};

