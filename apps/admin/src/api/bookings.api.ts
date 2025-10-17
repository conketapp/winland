/**
 * Bookings API Service
 */

import { apiRequest } from './client';
import type { Booking } from '../types/booking.types';

export const bookingsApi = {
  /**
   * Get all bookings
   */
  getAll: async (params?: {
    status?: string;
    projectId?: string;
  }): Promise<Booking[]> => {
    return apiRequest<Booking[]>({
      method: 'GET',
      url: '/bookings',
      params,
    });
  },

  /**
   * Approve booking
   */
  approve: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'PATCH',
      url: `/bookings/${id}/approve`,
    });
  },

  /**
   * Reject booking
   */
  reject: async (id: string, reason: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'PATCH',
      url: `/bookings/${id}/reject`,
      data: { reason },
    });
  },
};

