/**
 * Type Definitions
 */

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: 'CTV' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface Unit {
  id: string;
  code: string;
  projectId: string;
  project?: Project;
  buildingId: string;
  floorId: string;
  unitNumber: string;
  status: UnitStatus;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  direction?: string;
  commissionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  location?: string;
  city?: string;
}

export interface Reservation {
  id: string;
  code: string;
  unitId: string;
  unit?: Unit;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: ReservationStatus;
  priority: number;
  reservedUntil: string;
  depositDeadline?: string;
  notifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  code: string;
  unitId: string;
  unit?: Unit;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  status: BookingStatus;
  expiresAt: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  code: string;
  unitId: string;
  unit?: Unit;
  ctvId: string;
  customerName: string;
  customerIdCard: string;
  depositAmount: number;
  status: DepositStatus;
  createdAt: string;
}

export interface Commission {
  id: string;
  unitId: string;
  unit?: Unit;
  ctvId: string;
  depositId: string;
  amount: number;
  status: CommissionStatus;
  paidAt?: string;
  createdAt: string;
}

export type UnitStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'RESERVED_BOOKING' 
  | 'DEPOSITED' 
  | 'SOLD';

export type ProjectStatus = 
  | 'DRAFT' 
  | 'UPCOMING' 
  | 'OPEN' 
  | 'CLOSED';

export type ReservationStatus = 
  | 'ACTIVE' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'UPGRADED_TO_BOOKING';

export type BookingStatus = 
  | 'PENDING_APPROVAL' 
  | 'CONFIRMED' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'UPGRADED_TO_DEPOSIT';

export type DepositStatus = 
  | 'PENDING_APPROVAL' 
  | 'CONFIRMED' 
  | 'CANCELLED';

export type CommissionStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'PAID';

