// Removed PropertyType - only SALE now

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  SOLD = 'SOLD',
}

export interface PropertyImage {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: PropertyStatus;
  price: number;
  commissionRate: number; // Percentage (e.g., 2.0 = 2%)
  area: number;
  address: string;
  ward: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  direction?: string;
  legalDoc?: string;
  featured: boolean;
  views: number;
  createdBy: string;
  categoryId: string;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  images?: PropertyImage[];
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  slug: string;
  status?: PropertyStatus;
  price: number;
  commissionRate?: number; // Default 2.0%
  area: number;
  address: string;
  ward: string;
  district: string;
  city: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  direction?: string;
  legalDoc?: string;
  featured?: boolean;
  categoryId: string;
  images?: Array<{ url: string; caption?: string }>;
  amenityIds?: string[];
}

export interface QueryPropertyDto {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  city?: string;
  district?: string;
  categoryId?: string;
  createdBy?: string; // Filter by admin who created
}

