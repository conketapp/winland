import { IsString, IsEnum, IsOptional, IsNumber, Min, IsDateString, IsArray, MinLength, MaxLength, Matches } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  @MinLength(5, { message: 'Tên dự án phải có ít nhất 5 ký tự' })
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, { message: 'Mã dự án phải viết hoa, chỉ chứa chữ, số và dấu gạch ngang' })
  code: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsString()
  developer: string;

  @IsString()
  location: string;

  @IsString()
  address: string;

  @IsString()
  district: string;

  @IsString()
  city: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalArea?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalBuildings?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalUnits?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceFrom?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceTo?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  amenities?: string[];

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  masterPlan?: string;

  @IsString()
  @IsOptional()
  floorPlan?: string;

  @IsDateString()
  @IsOptional()
  openDate?: string;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  commissionRate?: number;
}

