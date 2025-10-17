import { IsOptional, IsString } from 'class-validator';

export class ConfirmTransactionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

