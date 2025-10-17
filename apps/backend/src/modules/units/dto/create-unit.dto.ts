import { IsString, IsNumber, Min, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { UnitStatus } from '@prisma/client';

export class CreateUnitDto {
  @IsString()
  projectId: string;

  @IsString()
  buildingId: string;

  @IsString()
  floorId: string;

  @IsString()
  unitNumber: string; // 01, 02, 03...

  @IsString()
  @IsOptional()
  unitTypeId?: string;

  @IsEnum(UnitStatus)
  @IsOptional()
  status?: UnitStatus;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  area: number;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @IsString()
  @IsOptional()
  direction?: string;

  @IsBoolean()
  @IsOptional()
  balcony?: boolean;

  @IsString()
  @IsOptional()
  view?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  floorPlanImage?: string;

  @IsOptional()
  images?: string[];

  @IsNumber()
  @IsOptional()
  commissionRate?: number;
}

