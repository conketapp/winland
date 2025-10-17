import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';
import { UnitStatus } from '@prisma/client';

export class QueryUnitDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  buildingId?: string;

  @IsOptional()
  @IsString()
  floorId?: string;

  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @IsOptional()
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @IsNumber()
  areaMin?: number;

  @IsOptional()
  @IsNumber()
  areaMax?: number;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsString()
  unitTypeId?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search by code

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

