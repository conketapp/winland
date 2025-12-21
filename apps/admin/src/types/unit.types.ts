/**
 * Unit Types
 * Type definitions for unit-related data
 */

export type UnitStatus = 'AVAILABLE' | 'RESERVED_BOOKING' | 'DEPOSITED' | 'SOLD';

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
  images?: string | null; // JSON string
  commissionRate?: number | null;
  createdAt: string;
  updatedAt: string;
  // Optional relations for richer Admin views
  project?: {
    id: string;
    name: string;
    code: string;
    status: string;
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
  // Additional optional fields for display
  notes?: string | null;
  actualPrice?: number | null;
  reservedAt?: string | null;
  bookedAt?: string | null;
  depositedAt?: string | null;
  soldAt?: string | null;
  _count?: {
    reservations: number;
    bookings: number;
  };
  statusDetails?: {
    hasActiveReservation: boolean;
    hasActiveBooking: boolean;
    actualStatus: 'RESERVED' | 'BOOKED' | 'RESERVED_BOOKING';
  };
}

export interface BulkUnitRow {
  building: string;
  floor: number;
  unit: string;
  type?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  direction?: string;
  view?: string;
  commissionRate?: number;
}

export interface BulkImportUnitsDto {
  projectId: string;
  units: BulkUnitRow[];
}

export interface BulkImportResult {
  message: string;
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  details: {
    created: Array<{
      row: number;
      code: string;
      id: string;
    }>;
    errors: Array<{
      row: number;
      error: string;
      data: BulkUnitRow;
    }>;
  };
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

