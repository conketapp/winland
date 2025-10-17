import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^0[3|5|7|8|9][0-9]{8}$/)
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP phải có 6 ký tự' })
  code: string;

  @IsString()
  purpose: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD';
}

