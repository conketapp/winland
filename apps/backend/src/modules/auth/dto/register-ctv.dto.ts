import { IsString, MinLength, MaxLength, Matches, Length } from 'class-validator';

export class RegisterCtvDto {
  @IsString()
  @Matches(/^0[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsString()
  @Length(6, 6)
  otpCode: string;

  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @MaxLength(100)
  fullName: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(50)
  password: string;
}

