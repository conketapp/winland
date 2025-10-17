export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

export interface Commission {
  id: string;
  propertyId: string;
  ctvId: string;
  leadId: string;
  amount: number;
  status: CommissionStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommissionDto {
  propertyId: string;
  ctvId: string;
  leadId: string;
  amount: number;
}

export interface UpdateCommissionDto {
  status?: CommissionStatus;
  paidAt?: Date;
}

