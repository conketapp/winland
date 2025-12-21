/**
 * Shared API Types
 * Types từ backend để đảm bảo type safety
 */

// ========== Common Types ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========== User Types ==========
export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  fullName: string;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  totalDeals: number;
  address?: string | null;
  gender?: string | null;
  birthday?: string | null;
  cifNumber?: string | null;
  sector?: string | null;
  workingPlace?: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CTV = 'CTV',
  USER = 'USER',
}

// ========== Project Types ==========
export interface Project {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  developer: string;
  location: string;
  address: string;
  district: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  totalArea?: number | null;
  totalBuildings?: number | null;
  totalUnits?: number | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  description?: string | null;
  amenities?: string | null;
  images?: string | null;
  masterPlan?: string | null;
  floorPlan?: string | null;
  openDate?: string | null;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  UPCOMING = 'UPCOMING',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// ========== Unit Types ==========
export interface Unit {
  id: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  code: string;
  unitNumber: string;
  unitTypeId?: string | null;
  status: UnitStatus;
  price: number;
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  direction?: string | null;
  balcony: boolean;
  view?: string | null;
  description?: string | null;
  floorPlanImage?: string | null;
  images?: string | null;
  commissionRate?: number | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  building?: Building;
  floor?: Floor;
  unitType?: UnitType;
}

export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED_BOOKING = 'RESERVED_BOOKING',
  DEPOSITED = 'DEPOSITED',
  SOLD = 'SOLD',
}

export interface Building {
  id: string;
  code: string;
  name: string;
  floors: number;
}

export interface Floor {
  id: string;
  number: number;
}

export interface UnitType {
  id: string;
  name: string;
  code: string;
}

// ========== Reservation Types ==========
export interface Reservation {
  id: string;
  code: string;
  unitId: string;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  notes?: string | null;
  status: ReservationStatus;
  priority: number;
  reservedUntil: string;
  extendCount: number;
  depositDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
  ctv?: User;
}

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  YOUR_TURN = 'YOUR_TURN',
  MISSED = 'MISSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// ========== Booking Types ==========
export interface Booking {
  id: string;
  code: string;
  unitId: string;
  ctvId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
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
  unit?: Unit;
  ctv?: User;
  approver?: User;
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  UPGRADED = 'UPGRADED',
}

// ========== Deposit Types ==========
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
  finalPrice?: number | null;
  status: DepositStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  cancelledBy?: string | null;
  cancelledReason?: string | null;
  refundAmount?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
  ctv?: User;
  approver?: User;
  paymentSchedules?: PaymentSchedule[];
}

export enum DepositStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CONFIRMED = 'CONFIRMED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// ========== Payment Schedule Types ==========
export interface PaymentSchedule {
  id: string;
  depositId: string;
  installment: number;
  name: string;
  percentage: number;
  amount: number;
  dueDate?: string | null;
  status: PaymentScheduleStatus;
  paidAmount: number;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentScheduleStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

// ========== Commission Types ==========
export interface Commission {
  id: string;
  unitId: string;
  ctvId: string;
  depositId: string;
  amount: number;
  rate: number;
  calculationBase: string;
  basePrice: number;
  status: CommissionStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

// ========== Notification Types ==========
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: string | null;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export enum NotificationType {
  RESERVATION_CREATED = 'RESERVATION_CREATED',
  RESERVATION_YOUR_TURN = 'RESERVATION_YOUR_TURN',
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_APPROVED = 'BOOKING_APPROVED',
  DEPOSIT_CREATED = 'DEPOSIT_CREATED',
  DEPOSIT_APPROVED = 'DEPOSIT_APPROVED',
  COMMISSION_CREATED = 'COMMISSION_CREATED',
  // ... more types
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

// ========== DTO Types ==========
export interface CreateReservationDto {
  unitId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export interface CreateBookingDto {
  unitId: string;
  reservationId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod?: string;
  paymentProof?: string | File | null;
  notes?: string;
}

export interface CreateDepositDto {
  unitId: string;
  reservationId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerIdCard: string;
  customerAddress: string;
  depositAmount: number;
  paymentMethod?: string;
  paymentProof?: string | File | null;
  notes?: string;
}

