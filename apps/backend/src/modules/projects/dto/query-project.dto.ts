import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class QueryProjectDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search in name, code

  @IsOptional()
  @IsString()
  sortBy?: string; // createdAt, name, openDate

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  // Pagination - not validated in DTO, parsed in controller
  page?: number;
  pageSize?: number;
}

