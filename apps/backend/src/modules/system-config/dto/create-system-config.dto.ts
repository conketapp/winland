import { IsString, IsIn, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateSystemConfigDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  key: string;

  @IsString()
  value: string;

  @IsString()
  @IsIn(['number', 'string', 'boolean', 'json'])
  type: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  label: string;

  @IsString()
  @IsIn(['general', 'bank', 'reservation', 'booking', 'deposit', 'commission', 'otp', 'notification', 'pdf'])
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['SUPER_ADMIN', 'ADMIN'])
  editableBy?: string;
}

