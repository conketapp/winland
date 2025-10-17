import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Send OTP (CTV)
   */
  async sendOtp(phone: string, purpose: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD') {
    // Check if phone exists based on purpose
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (purpose === 'REGISTER' && existingUser) {
      throw new ConflictException('Số điện thoại đã được đăng ký');
    }

    if (purpose === 'LOGIN' && !existingUser) {
      throw new BadRequestException('Số điện thoại chưa được đăng ký');
    }

    if (purpose === 'RESET_PASSWORD' && !existingUser) {
      throw new BadRequestException('Số điện thoại chưa được đăng ký');
    }

    return await this.otpService.sendOtp(phone, purpose);
  }

  /**
   * Register CTV with OTP
   */
  async registerCtv(phone: string, otpCode: string, fullName: string, password: string) {
    // Verify OTP
    await this.otpService.verifyOtp(phone, otpCode, 'REGISTER');

    // Check if phone already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('Số điện thoại đã được đăng ký');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        phone,
        fullName,
        password: hashedPassword,
        role: UserRole.CTV,
      },
    });

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  /**
   * Login CTV with OTP + Password
   */
  async loginCtv(phone: string, otpCode: string, password: string) {
    // Verify OTP
    await this.otpService.verifyOtp(phone, otpCode, 'LOGIN');

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không đúng');
    }

    // Check if active
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng liên hệ admin');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  /**
   * Login Admin with Email + Password (no OTP)
   */
  async loginAdmin(email: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Check role (must be ADMIN or SUPER_ADMIN)
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Bạn không có quyền truy cập trang admin');
    }

    // Check if active
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(phone: string, otpCode: string, newPassword: string) {
    // Verify OTP
    await this.otpService.verifyOtp(phone, otpCode, 'RESET_PASSWORD');

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new BadRequestException('Số điện thoại không tồn tại');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // TODO: Invalidate all existing tokens (logout all devices)
    // This requires implementing token blacklist or refresh token system

    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại',
    };
  }

  /**
   * Get current user info
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    return user;
  }
}
