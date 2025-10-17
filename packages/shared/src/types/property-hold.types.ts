export enum PropertyHoldStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  CANCELLED_BY_ADMIN = 'CANCELLED_BY_ADMIN',
  AUTO_CANCELLED = 'AUTO_CANCELLED',
}

export interface PropertyHold {
  id: string;
  propertyId: string;
  ctvId: string;
  status: PropertyHoldStatus;
  holdUntil: Date;
  reason?: string;
  extendCount: number;
  cancelledBy?: string;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyHoldDto {
  propertyId: string;
  reason?: string;
  customDurationHours?: number; // Admin can override default
}

export interface ExtendPropertyHoldDto {
  customDurationHours?: number; // Admin can set custom
}

export interface CancelPropertyHoldDto {
  reason?: string; // For admin cancellation
}

export interface CheckPropertyHoldResponse {
  isHeld: boolean;
  holdBy?: {
    id: string;
    fullName: string;
  };
  holdUntil?: Date;
  canIHold: boolean; // CTV có thể giữ không
  myActiveHold?: PropertyHold; // Nếu CTV đang giữ
}

