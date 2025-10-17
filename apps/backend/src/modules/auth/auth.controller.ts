import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { RegisterCtvDto } from './dto/register-ctv.dto';
import { LoginCtvDto } from './dto/login-ctv.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Send OTP to phone (for CTV)
   * POST /api/auth/send-otp
   */
  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return await this.authService.sendOtp(dto.phone, dto.purpose);
  }

  /**
   * Register CTV with Phone + OTP
   * POST /api/auth/register-ctv
   */
  @Post('register-ctv')
  async registerCtv(@Body() dto: RegisterCtvDto) {
    return await this.authService.registerCtv(
      dto.phone,
      dto.otpCode,
      dto.fullName,
      dto.password,
    );
  }

  /**
   * Login CTV with Phone + OTP + Password
   * POST /api/auth/login-ctv
   */
  @Post('login-ctv')
  async loginCtv(@Body() dto: LoginCtvDto) {
    return await this.authService.loginCtv(
      dto.phone,
      dto.otpCode,
      dto.password,
    );
  }

  /**
   * Login Admin with Email + Password (no OTP)
   * POST /api/auth/login-admin
   */
  @Post('login-admin')
  async loginAdmin(@Body() dto: LoginAdminDto) {
    return await this.authService.loginAdmin(dto.email, dto.password);
  }

  /**
   * Reset password with OTP
   * POST /api/auth/reset-password
   */
  @Post('reset-password')
  async resetPassword(
    @Body() dto: { phone: string; otpCode: string; newPassword: string },
  ) {
    return await this.authService.resetPassword(
      dto.phone,
      dto.otpCode,
      dto.newPassword,
    );
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return await this.authService.getMe(req.user.userId);
  }
}
