import { IsString, IsOptional } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

