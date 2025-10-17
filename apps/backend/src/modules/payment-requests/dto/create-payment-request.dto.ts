import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsString()
  commissionId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

