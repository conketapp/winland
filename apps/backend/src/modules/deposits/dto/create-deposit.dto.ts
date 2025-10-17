import { IsString, IsNumber, Min, MinLength, MaxLength, IsEmail, IsOptional, IsArray, Matches } from 'class-validator';

export class CreateDepositDto {
  @IsString()
  unitId: string;

  @IsString()
  @IsOptional()
  reservationId?: string; // If upgrading from reservation

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName: string;

  @IsString()
  @Matches(/^0[3|5|7|8|9][0-9]{8}$/)
  customerPhone: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @Matches(/^[0-9]{9,12}$/, { message: 'CMND/CCCD phải có 9 hoặc 12 số' })
  customerIdCard: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  customerAddress: string;

  @IsNumber()
  @Min(0)
  depositAmount: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsArray()
  @IsOptional()
  paymentProof?: string[]; // Array of file URLs

  @IsString()
  @IsOptional()
  notes?: string;
}

