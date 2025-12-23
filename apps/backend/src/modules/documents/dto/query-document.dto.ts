import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDocumentDto {
  @IsString()
  @IsOptional()
  entityType?: string; // 'deposit', 'booking', etc.

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  documentType?: string; // 'CMND_FRONT', 'PAYMENT_PROOF', etc.

  @IsString()
  @IsOptional()
  status?: string; // 'DRAFT', 'FINAL', 'ARCHIVED'

  @IsString()
  @IsOptional()
  uploadedBy?: string; // User ID

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 20;
}
