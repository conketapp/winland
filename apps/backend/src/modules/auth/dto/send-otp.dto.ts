import { IsString, IsEnum, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Matches(/^0[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ (VN format)',
  })
  phone: string;

  @IsEnum(['REGISTER', 'LOGIN', 'RESET_PASSWORD'])
  purpose: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD';
}

