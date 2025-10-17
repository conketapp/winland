export interface Amenity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAmenityDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

