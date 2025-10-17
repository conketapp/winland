import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate booking code: BOK-YYYYMMDD-XXX
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    const count = await this.prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });

    const counter = (count + 1).toString().padStart(3, '0');
    return `BOK-${dateStr}-${counter}`;
  }

  /**
   * Get booking amount from SystemConfig (or default 10,000,000)
   * TODO: Implement SystemConfigService
   */
  private async getBookingAmount(): Promise<number> {
    // For now, return default. Later get from SystemConfig
    return 10000000; // 10 triệu VNĐ
  }

  /**
   * Create booking (CTV, for OPEN projects or from Reservation)
   */
  async create(dto: CreateBookingDto, ctvId: string) {
    // Get unit with project info
    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      include: { project: true },
    });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    // BUSINESS RULE: Project must be OPEN (or upgrading from reservation)
    if (unit.project.status !== 'OPEN' && !dto.reservationId) {
      throw new BadRequestException('Chỉ có thể tạo booking khi dự án đã mở bán');
    }

    // BUSINESS RULE: Unit must be AVAILABLE or RESERVED_BOOKING
    if (unit.status !== 'AVAILABLE' && unit.status !== 'RESERVED_BOOKING') {
      throw new BadRequestException(`Căn này đã ${unit.status}`);
    }

    // If upgrading from reservation, validate
    if (dto.reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
      });

      if (!reservation) {
        throw new NotFoundException('Phiếu giữ chỗ không tồn tại');
      }

      if (reservation.ctvId !== ctvId) {
        throw new ForbiddenException('Đây không phải phiếu giữ chỗ của bạn');
      }

      if (reservation.status !== 'YOUR_TURN' && reservation.status !== 'ACTIVE') {
        throw new BadRequestException('Phiếu giữ chỗ không hợp lệ');
      }
    }

    // Get booking amount from config
    const bookingAmount = await this.getBookingAmount();

    // Generate code
    const code = await this.generateCode();

    // Calculate expires at (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Determine status based on payment proof
    const status = dto.paymentProof && dto.paymentProof.length > 0 
      ? 'PENDING_APPROVAL' 
      : 'PENDING_PAYMENT';

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        code,
        unitId: dto.unitId,
        ctvId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        customerIdCard: dto.customerIdCard,
        customerAddress: dto.customerAddress,
        bookingAmount,
        paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
        paymentProof: dto.paymentProof ? JSON.stringify(dto.paymentProof) : null,
        status,
        expiresAt,
        notes: dto.notes,
      },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // Update unit status
    await this.prisma.unit.update({
      where: { id: dto.unitId },
      data: { status: 'RESERVED_BOOKING' },
    });

    // If from reservation, mark as UPGRADED
    if (dto.reservationId) {
      await this.prisma.reservation.update({
        where: { id: dto.reservationId },
        data: { status: 'COMPLETED' }, // Changed from UPGRADED to COMPLETED
      });
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: ctvId,
        action: 'CREATE',
        entityType: 'BOOKING',
        entityId: booking.id,
        newValue: JSON.stringify(booking),
      },
    });

    return {
      ...booking,
      message: status === 'PENDING_APPROVAL' 
        ? 'Tạo booking thành công! Chờ admin duyệt' 
        : 'Tạo booking thành công! Vui lòng thanh toán',
    };
  }

  /**
   * Admin approve booking
   */
  async approve(id: string, adminId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Booking này đã được xử lý');
    }

    // Update booking
    await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'APPROVE',
        entityType: 'BOOKING',
        entityId: id,
      },
    });

    return { message: 'Duyệt booking thành công' };
  }

  /**
   * Admin reject booking
   */
  async reject(id: string, adminId: string, reason: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { unit: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    // Update booking
    await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledReason: reason,
      },
    });

    // Release unit
    await this.prisma.unit.update({
      where: { id: booking.unitId },
      data: { status: 'AVAILABLE' },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'REJECT',
        entityType: 'BOOKING',
        entityId: id,
        newValue: JSON.stringify({ reason }),
      },
    });

    return { message: 'Từ chối booking thành công' };
  }

  /**
   * Cancel booking (CTV or Admin)
   */
  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { unit: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    // Check permission
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isOwner = booking.ctvId === userId;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền hủy booking này');
    }

    // Calculate refund (if CONFIRMED, refund 50%)
    let refundAmount = 0;
    if (booking.status === 'CONFIRMED') {
      refundAmount = booking.bookingAmount * 0.5; // 50% refund
    } else {
      refundAmount = booking.bookingAmount; // Full refund if not confirmed
    }

    // Update booking
    await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledReason: reason,
        refundAmount,
      },
    });

    // Release unit
    await this.prisma.unit.update({
      where: { id: booking.unitId },
      data: { status: 'AVAILABLE' },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CANCEL',
        entityType: 'BOOKING',
        entityId: id,
        newValue: JSON.stringify({ reason, refundAmount }),
      },
    });

    return { 
      message: 'Hủy booking thành công',
      refundAmount,
    };
  }

  /**
   * Get all bookings (Admin)
   */
  async findAll(filters?: { status?: string; projectId?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.projectId) {
      where.unit = { projectId: filters.projectId };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map(b => ({
      ...b,
      paymentProof: b.paymentProof ? JSON.parse(b.paymentProof) : [],
    }));
  }

  /**
   * Get my bookings (CTV)
   */
  async getMyBookings(ctvId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { ctvId },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map(b => ({
      ...b,
      paymentProof: b.paymentProof ? JSON.parse(b.paymentProof) : [],
    }));
  }

  /**
   * CRONJOB: Auto expire bookings after 48h
   */
  async processExpiredBookings() {
    const now = new Date();

    const expired = await this.prisma.booking.findMany({
      where: {
        status: { in: ['PENDING_PAYMENT', 'PENDING_APPROVAL'] },
        expiresAt: {
          lt: now,
        },
      },
    });

    for (const booking of expired) {
      // Update to EXPIRED
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'EXPIRED' },
      });

      // Release unit
      await this.prisma.unit.update({
        where: { id: booking.unitId },
        data: { status: 'AVAILABLE' },
      });

      // Audit log
      await this.prisma.auditLog.create({
        data: {
          action: 'AUTO_EXPIRE',
          entityType: 'BOOKING',
          entityId: booking.id,
        },
      });
    }

    return { processed: expired.length };
  }
}

