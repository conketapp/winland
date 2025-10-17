import { IsString, MinLength, MaxLength, IsEmail, IsOptional, IsArray, Matches } from 'class-validator';

export class CreateBookingDto {
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
  @Matches(/^0[3|5|7|8|9][0-9]{8}$/, { message: 'Số điện thoại không hợp lệ' })
  customerPhone: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @Matches(/^[0-9]{9,12}$/, { message: 'CMND/CCCD phải có 9 hoặc 12 số' })
  customerIdCard: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  customerAddress: string;

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

