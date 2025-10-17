import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryPaymentRequestDto {
  @IsOptional()
  @IsString()
  ctvId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: string;
}

