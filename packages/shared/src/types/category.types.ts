export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
}

