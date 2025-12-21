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
  // Optional relations for richer Admin views
  unit?: {
    id: string;
    code: string;
    area: number;
    price: number;
    project?: {
      id: string;
      name: string;
      code: string;
    };
    building?: {
      id: string;
      code: string;
      name: string;
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
  paymentSchedules?: Array<{
    id: string;
    installment: number;
    amount: number;
    paidAmount: number;
    dueDate: string;
    status: string;
    paidAt?: string | null;
  }>;
  approver?: {
    id: string;
    fullName: string;
    email: string;
  };
}

