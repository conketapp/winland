import { IsString } from 'class-validator';

export class RejectPaymentRequestDto {
  @IsString()
  rejectedReason: string;
}

