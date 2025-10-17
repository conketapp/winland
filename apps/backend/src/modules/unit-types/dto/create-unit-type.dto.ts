import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUnitTypeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

