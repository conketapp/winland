/**
 * Project Types
 * Type definitions for project-related data
 */

export type ProjectStatus = 'UPCOMING' | 'OPEN' | 'CLOSED';

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
  amenities?: string | null; // JSON string
  images?: string | null; // JSON string
  masterPlan?: string | null;
  floorPlan?: string | null;
  openDate?: string | null;
  commissionRate: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  code: string;
  status?: ProjectStatus;
  developer: string;
  location: string;
  address: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  totalBuildings?: number;
  totalUnits?: number;
  priceFrom?: number;
  priceTo?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  masterPlan?: string;
  floorPlan?: string;
  openDate?: string;
  commissionRate?: number;
}

export interface ProjectStatistics {
  project: {
    id: string;
    name: string;
    code: string;
    status: ProjectStatus;
  };
  units: {
    total: number;
    available: number;
    reserved_booking: number;
    deposited: number;
    sold: number;
  };
  reservations: {
    inQueue: number;
  };
}

