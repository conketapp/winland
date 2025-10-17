import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate reservation code: RSV-YYYYMMDD-XXX
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // Count reservations created today
    const count = await this.prisma.reservation.count({
      where: {
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });

    const counter = (count + 1).toString().padStart(3, '0');
    return `RSV-${dateStr}-${counter}`;
  }

  /**
   * Create reservation (CTV only, for UPCOMING projects)
   * Multiple CTVs can reserve same unit (queue system)
   */
  async create(dto: CreateReservationDto, ctvId: string) {
    // Get unit with project info
    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      include: { project: true },
    });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    // BUSINESS RULE: Can only reserve UPCOMING projects
    if (unit.project.status !== 'UPCOMING') {
      throw new BadRequestException(
        'Chỉ có thể giữ chỗ cho dự án UPCOMING (sắp mở bán)'
      );
    }

    // BUSINESS RULE: Unit must be AVAILABLE
    if (unit.status !== 'AVAILABLE') {
      throw new BadRequestException(`Căn này đã ${unit.status}`);
    }

    // Check if CTV already reserved this unit
    const existing = await this.prisma.reservation.findFirst({
      where: {
        unitId: dto.unitId,
        ctvId,
        status: { in: ['ACTIVE', 'YOUR_TURN'] },
      },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã giữ chỗ căn này rồi');
    }

    // Count existing reservations to determine priority
    const existingCount = await this.prisma.reservation.count({
      where: {
        unitId: dto.unitId,
        status: { in: ['ACTIVE', 'YOUR_TURN'] },
      },
    });

    const priority = existingCount + 1;

    // Generate code
    const code = await this.generateCode();

    // Create reservation
    const reservation = await this.prisma.reservation.create({
      data: {
        code,
        unitId: dto.unitId,
        ctvId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        notes: dto.notes,
        status: 'ACTIVE',
        priority,
        reservedUntil: unit.project.openDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
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

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: ctvId,
        action: 'CREATE',
        entityType: 'RESERVATION',
        entityId: reservation.id,
        newValue: JSON.stringify(reservation),
      },
    });

    return {
      ...reservation,
      message: `Giữ chỗ thành công! Bạn đang ở vị trí #${priority} trong hàng chờ`,
    };
  }

  /**
   * Get my reservations (CTV)
   */
  async getMyReservations(ctvId: string) {
    const reservations = await this.prisma.reservation.findMany({
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

    return reservations;
  }

  /**
   * Get all reservations (Admin)
   */
  async findAll(filters?: { status?: string; projectId?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.projectId) {
      where.unit = {
        projectId: filters.projectId,
      };
    }

    return await this.prisma.reservation.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Cancel reservation (CTV own or Admin)
   */
  async cancel(id: string, userId: string, reason?: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { ctv: true },
    });

    if (!reservation) {
      throw new NotFoundException('Phiếu giữ chỗ không tồn tại');
    }

    // Check permission (must be owner or admin)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (reservation.ctvId !== userId && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Bạn không có quyền hủy phiếu này');
    }

    // Update status
    await this.prisma.reservation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: userId,
        cancelledReason: reason,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CANCEL',
        entityType: 'RESERVATION',
        entityId: id,
        newValue: JSON.stringify({ status: 'CANCELLED', reason }),
      },
    });

    return { message: 'Hủy giữ chỗ thành công' };
  }

  /**
   * CRONJOB: Process missed turns (YOUR_TURN → MISSED after deadline)
   */
  async processMissedTurns() {
    const now = new Date();

    // Find reservations that missed their turn
    const missed = await this.prisma.reservation.findMany({
      where: {
        status: 'YOUR_TURN',
        depositDeadline: {
          lt: now,
        },
      },
      include: {
        unit: true,
      },
    });

    for (const reservation of missed) {
      // Update to MISSED
      await this.prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'MISSED' },
      });

      // Move to next CTV in queue
      await this.moveToNextInQueue(reservation.unitId);
    }

    return { processed: missed.length };
  }

  /**
   * Move to next CTV in queue for a unit
   */
  private async moveToNextInQueue(unitId: string) {
    // Find next active reservation
    const nextReservation = await this.prisma.reservation.findFirst({
      where: {
        unitId,
        status: 'ACTIVE',
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    if (nextReservation) {
      const depositDeadline = new Date();
      depositDeadline.setHours(depositDeadline.getHours() + 48);

      await this.prisma.reservation.update({
        where: { id: nextReservation.id },
        data: {
          status: 'YOUR_TURN',
          notifiedAt: new Date(),
          depositDeadline,
        },
      });

      // TODO: Send notification to CTV
      // await this.notificationService.sendYourTurnNotification(nextReservation.ctvId);
    }
  }
}

