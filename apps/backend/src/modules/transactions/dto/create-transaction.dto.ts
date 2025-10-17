import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  depositId: string;

  @IsOptional()
  @IsString()
  paymentScheduleId?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentProof?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

