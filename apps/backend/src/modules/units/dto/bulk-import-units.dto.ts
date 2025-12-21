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
  @Min(0.01, { message: 'Diện tích phải lớn hơn 0' })
  area: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Số phòng ngủ phải >= 0' })
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Số phòng WC phải >= 0' })
  bathrooms?: number;

  @IsNumber()
  @Min(0.01, { message: 'Giá phải lớn hơn 0' })
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

