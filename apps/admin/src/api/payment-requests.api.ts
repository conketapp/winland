/**
 * Payment Requests API Service
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';

export interface PaymentRequest {
  id: string;
  ctvId: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  notes?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  approvedBy?: string | null;
  approvedAt?: string | null;
  paidBy?: string | null;
  paidAt?: string | null;
  paidProof?: string | null;
  rejectedReason?: string | null;
  createdAt: string;
  ctv?: {
    fullName: string;
    phone: string;
    email?: string;
  };
}

export const paymentRequestsApi = {
  /**
   * Get all payment requests
   */
  getAll: async (params?: {
    status?: string;
    ctvId?: string;
  }): Promise<PaymentRequest[]> => {
    return apiRequest<PaymentRequest[]>({
      method: 'GET',
      url: API_ENDPOINTS.PAYMENT_REQUESTS.BASE,
      params,
    });
  },

  /**
   * Get payment request by ID
   */
  getById: async (id: string): Promise<PaymentRequest> => {
    return apiRequest<PaymentRequest>({
      method: 'GET',
      url: API_ENDPOINTS.PAYMENT_REQUESTS.BY_ID(id),
    });
  },

  /**
   * Approve payment request (Admin only)
   */
  approve: async (id: string): Promise<PaymentRequest> => {
    return apiRequest<PaymentRequest>({
      method: 'POST',
      url: API_ENDPOINTS.PAYMENT_REQUESTS.APPROVE(id),
    });
  },

  /**
   * Reject payment request (Admin only)
   */
  reject: async (id: string, reason: string): Promise<PaymentRequest> => {
    return apiRequest<PaymentRequest>({
      method: 'POST',
      url: API_ENDPOINTS.PAYMENT_REQUESTS.REJECT(id),
      data: { rejectedReason: reason },
    });
  },

  /**
   * Mark as paid (Admin only)
   */
  markAsPaid: async (id: string, proofUrl?: string): Promise<PaymentRequest> => {
    return apiRequest<PaymentRequest>({
      method: 'POST',
      url: API_ENDPOINTS.PAYMENT_REQUESTS.MARK_PAID(id),
      data: { paidProof: proofUrl },
    });
  },
};

