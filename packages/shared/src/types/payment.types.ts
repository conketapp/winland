export enum PaymentRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface PaymentRequest {
  id: string;
  commissionId: string;
  ctvId: string;
  amount: number;
  status: PaymentRequestStatus;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequestDto {
  commissionId: string;
  amount: number;
}

export interface ApprovePaymentRequestDto {
  status: 'APPROVED' | 'REJECTED';
  rejectedReason?: string;
}

