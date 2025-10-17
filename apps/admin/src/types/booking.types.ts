/**
 * Booking Types
 */

export type BookingStatus = 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'UPGRADED';

export interface Booking {
  id: string;
  code: string;
  unitId: string;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerIdCard: string;
  customerAddress: string;
  bookingAmount: number;
  paymentMethod: string;
  paymentProof?: string | null;
  status: BookingStatus;
  expiresAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  cancelledReason?: string | null;
  refundAmount?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

