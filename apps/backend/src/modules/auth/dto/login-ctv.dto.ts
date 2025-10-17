import { IsString, Length, Matches } from 'class-validator';

export class LoginCtvDto {
  @IsString()
  @Matches(/^0[3|5|7|8|9][0-9]{8}$/)
  phone: string;

  @IsString()
  @Length(6, 6)
  otpCode: string;

  @IsString()
  password: string;
}

