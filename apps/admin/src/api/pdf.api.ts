/**
 * PDF API Service
 * Wrapper around backend PDF generation endpoints
 */

import { apiRequest } from './client';

export const pdfApi = {
  /**
   * Generate Reservation PDF and get URL
   */
  getReservationPdf: async (id: string): Promise<{ reservationId: string; pdfUrl: string }> => {
    return apiRequest<{ reservationId: string; pdfUrl: string }>({
      method: 'GET',
      url: `/pdf/reservations/${id}`,
    });
  },

  /**
   * Generate Booking PDF and get URL
   */
  getBookingPdf: async (id: string): Promise<{ bookingId: string; pdfUrl: string }> => {
    return apiRequest<{ bookingId: string; pdfUrl: string }>({
      method: 'GET',
      url: `/pdf/bookings/${id}`,
    });
  },

  /**
   * Generate Deposit PDF (contract) and get URL
   */
  getDepositPdf: async (id: string): Promise<{ depositId: string; pdfUrl: string }> => {
    return apiRequest<{ depositId: string; pdfUrl: string }>({
      method: 'GET',
      url: `/pdf/deposits/${id}`,
    });
  },
};











