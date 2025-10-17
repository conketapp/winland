/**
 * Deposit Types
 */

export type DepositStatus = 'PENDING_APPROVAL' | 'CONFIRMED' | 'OVERDUE' | 'CANCELLED' | 'COMPLETED';

export interface Deposit {
  id: string;
  code: string;
  unitId: string;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerIdCard: string;
  customerAddress: string;
  depositAmount: number;
  depositPercentage: number;
  depositDate: string;
  paymentMethod: string;
  paymentProof?: string | null;
  contractUrl?: string | null;
  status: DepositStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  cancelledBy?: string | null;
  cancelledReason?: string | null;
  refundAmount?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

