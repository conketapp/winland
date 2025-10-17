import { IsString, IsNumber, Min, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUnitRowDto {
  @IsString()
  building: string; // Building code (A1, B2)

  @IsNumber()
  floor: number; // Floor number (8, 10, 15)

  @IsString()
  unit: string; // Unit number (01, 02, 03)

  @IsString()
  @IsOptional()
  type?: string; // Studio, 1PN, 2PN...

  @IsNumber()
  @Min(0)
  area: number;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  direction?: string;

  @IsString()
  @IsOptional()
  view?: string;

  @IsNumber()
  @IsOptional()
  commissionRate?: number;
}

export class BulkImportUnitsDto {
  @IsString()
  projectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUnitRowDto)
  units: BulkUnitRowDto[];
}

