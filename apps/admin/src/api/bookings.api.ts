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
    ctvId?: string;
  }): Promise<Booking[]> => {
    return apiRequest<Booking[]>({
      method: 'GET',
      url: '/bookings',
      params,
    });
  },

  /**
   * Update payment proof for a booking
   */
   updatePaymentProof: async (id: string, paymentProof: string | File | FormData): Promise<{ message: string; booking: Booking }> => {
    return apiRequest<{ message: string; booking: Booking }>({
      method: 'PATCH',
      url: `/bookings/${id}/payment-proof`,
      data: { paymentProof },
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

  /**
   * Get trash bookings (EXPIRED / CANCELLED still locking units)
   */
  getTrash: async (): Promise<Booking[]> => {
    return apiRequest<Booking[]>({
      method: 'GET',
      url: '/bookings/trash',
    });
  },

  /**
   * Cleanup booking: release unit back to AVAILABLE
   */
  cleanup: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'PATCH',
      url: `/bookings/${id}/cleanup`,
    });
  },
};

