import { IsOptional, IsString } from 'class-validator';

export class ApprovePaymentRequestDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

