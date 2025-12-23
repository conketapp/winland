import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum SalesGroupBy {
  PROJECT = 'project',
  CTV = 'ctv',
}

export class SalesReportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  projectId?: string;

  @IsOptional()
  ctvId?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  @IsEnum(SalesGroupBy)
  groupBy?: SalesGroupBy = SalesGroupBy.PROJECT;
}

