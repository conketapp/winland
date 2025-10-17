import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryTransactionDto {
  @IsOptional()
  @IsString()
  depositId?: string;

  @IsOptional()
  @IsString()
  paymentScheduleId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED'])
  status?: string;
}

