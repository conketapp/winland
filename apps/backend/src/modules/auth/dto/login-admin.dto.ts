import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginAdminDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

