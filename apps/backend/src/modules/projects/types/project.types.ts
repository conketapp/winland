/**
 * Project Types
 * Type definitions for Project module
 */

import { Project, ProjectStatus } from '@prisma/client';

/**
 * Project with creator and counts
 */
export interface ProjectWithCounts {
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
  openDate?: Date | null;
  commissionRate: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  creator?: {
    id: string;
    fullName: string;
    email?: string | null;
  };
  _count?: {
    buildings: number;
    units: number;
  };
}

/**
 * Project with full relations
 */
export interface ProjectWithRelations extends Project {
  creator: {
    id: string;
    fullName: string;
    email: string | null;
  };
  buildings?: Array<{
    id: string;
    code: string;
    name: string;
    floorsData?: Array<{
      id: string;
      number: number;
      buildingId: string;
    }>;
    _count?: {
      floorsData: number;
      units: number;
    };
  }>;
  _count?: {
    units: number;
  };
}

/**
 * Project statistics
 */
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
