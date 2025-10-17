import { IsString, MinLength, MaxLength, IsEmail, IsOptional, Matches } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  unitId: string;

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
  @IsOptional()
  notes?: string;
}

