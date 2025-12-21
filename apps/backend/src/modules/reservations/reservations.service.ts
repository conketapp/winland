import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ReservationStatus } from '@prisma/client';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { CodeGeneratorService, CodeType } from '../common/services/code-generator.service';
import { ErrorMessages } from '../../common/constants/error-messages';
import { PaginationUtil, PaginationOptions, PaginationResult } from '../../common/utils/pagination.util';
import { QueryOptimizerUtil } from '../../common/utils/query-optimizer.util';
import { UnitsService } from '../units/units.service';

@Injectable()
export class ReservationsService {
  /**
   * Valid status transitions for reservations
   * Maps current status to array of allowed next statuses
   */
  private static readonly VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
    ACTIVE: ['YOUR_TURN', 'EXPIRED', 'CANCELLED', 'COMPLETED'],
    YOUR_TURN: ['COMPLETED', 'MISSED', 'EXPIRED', 'CANCELLED'],
    MISSED: ['CANCELLED'], // Can only cancel after missed
    EXPIRED: ['CANCELLED'], // Can only cancel after expired (if needed)
    CANCELLED: [], // Terminal state - no further transitions
    COMPLETED: [], // Terminal state - no further transitions
  };

  /**
   * Validate reservation status transition
   * @throws BadRequestException if transition is invalid
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const allowedTransitions = ReservationsService.VALID_STATUS_TRANSITIONS[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
        `Allowed transitions from ${currentStatus}: ${allowedTransitions.join(', ') || 'none (terminal state)'}`
      );
    }
  }

  /**
   * Validate unit is available for reservation
   * @throws BadRequestException if unit is not available
   */
  private validateUnitAvailableForReservation(unit: { status: string; id: string }): void {
    if (unit.status !== 'AVAILABLE') {
      throw new BadRequestException(ErrorMessages.UNIT.NOT_AVAILABLE(unit.status));
    }
  }

  /**
   * Validate project status for reservation (must be UPCOMING)
   * @throws BadRequestException if project status is invalid
   */
  private validateProjectStatusForReservation(project: { status: string; id: string }): void {
    if (project.status !== 'UPCOMING') {
      throw new BadRequestException(ErrorMessages.PROJECT.NOT_UPCOMING);
    }
  }

  /**
   * Validate CTV ownership or admin role
   * @param entityCtvId CTV ID of the entity
   * @param userId Current user ID
   * @param userRole Current user role (optional, will be fetched if not provided)
   * @throws ForbiddenException if user is not owner or admin
   */
  private async validateCTVOwnershipOrAdmin(
    entityCtvId: string,
    userId: string,
    userRole?: string,
  ): Promise<void> {
    if (entityCtvId === userId) {
      return; // Owner can always access
    }

    // If role not provided, fetch user
    let role = userRole;
    if (!role) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      role = user?.role;
    }

    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(ErrorMessages.COMMON.FORBIDDEN);
    }
  }

  /**
   * Safe error handler for non-critical operations (e.g., syncUnitStatus, notifications)
   * Logs error but doesn't throw - used for operations that shouldn't fail the main flow
   * 
   * @param operation Description of the operation (for logging)
   * @param error The error that occurred
   * @param context Additional context for logging (entityId, etc.)
   */
  private handleNonCriticalError(operation: string, error: unknown, context?: Record<string, string>): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const contextStr = context ? ` [${Object.entries(context).map(([k, v]) => `${k}=${v}`).join(', ')}]` : '';
    console.error(`[Non-critical error] ${operation}${contextStr}: ${errorMessage}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private systemConfigService: SystemConfigService,
    private codeGenerator: CodeGeneratorService,
    @Inject(forwardRef(() => UnitsService))
    private unitsService: UnitsService,
  ) {}

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
      throw new NotFoundException(ErrorMessages.UNIT.NOT_FOUND);
    }

    // Validate project status
    this.validateProjectStatusForReservation(unit.project);

    // Validate unit status
    this.validateUnitAvailableForReservation(unit);

    // Check if CTV already reserved this unit
    const existing = await this.prisma.reservation.findFirst({
      where: {
        unitId: dto.unitId,
        ctvId,
        status: { in: ['ACTIVE', 'YOUR_TURN'] },
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(ErrorMessages.RESERVATION.ALREADY_EXISTS);
    }

    // Count existing reservations to determine priority
    const existingCount = await this.prisma.reservation.count({
      where: {
        unitId: dto.unitId,
        status: { in: ['ACTIVE', 'YOUR_TURN'] },
      },
    });

    const priority = existingCount + 1;

    // Wrap in transaction to ensure atomicity
    return await this.prisma.$transaction(
      async (tx) => {
        // Re-check unit status (atomic - within transaction)
        const currentUnit = await tx.unit.findUnique({
          where: { id: dto.unitId },
          include: { project: true },
        });

        if (!currentUnit) {
          throw new NotFoundException(ErrorMessages.UNIT.NOT_FOUND);
        }

        // Re-validate unit status (atomic - within transaction)
        this.validateUnitAvailableForReservation(currentUnit);

        // Re-check if CTV already reserved this unit (atomic)
        const existingCheck = await tx.reservation.findFirst({
          where: {
            unitId: dto.unitId,
            ctvId,
            status: { in: ['ACTIVE', 'YOUR_TURN'] },
            deletedAt: null,
          },
        });

        if (existingCheck) {
          throw new BadRequestException(ErrorMessages.RESERVATION.ALREADY_EXISTS);
        }

        // Count existing reservations to determine priority (atomic)
        const existingCount = await tx.reservation.count({
          where: {
            unitId: dto.unitId,
            status: { in: ['ACTIVE', 'YOUR_TURN'] },
            deletedAt: null,
          },
        });

        const priority = existingCount + 1;

        // Generate code: RS000001, RS000002, ... (within transaction)
        const code = await this.codeGenerator.generateCode(CodeType.RESERVATION, tx);

        // Get reservation duration from SystemConfig (hours)
        const configValues = await this.systemConfigService.getValuesByKeys([
          'reservation_duration_hours',
        ]);
        const durationHours =
          typeof configValues.reservation_duration_hours === 'number'
            ? (configValues.reservation_duration_hours as number)
            : 24;
        
        // Calculate reservedUntil: min(openDate, now + durationHours)
        // Reservation should expire when project opens OR after durationHours, whichever comes first
        const durationMs = durationHours * 60 * 60 * 1000;
        const expiryFromNow = new Date(Date.now() + durationMs);
        const reservedUntil = currentUnit.project.openDate
          ? new Date(Math.min(currentUnit.project.openDate.getTime(), expiryFromNow.getTime()))
          : expiryFromNow;

        // Create reservation (atomic)
        const reservation = await tx.reservation.create({
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
            reservedUntil,
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

        // Create audit log (atomic)
        await tx.auditLog.create({
          data: {
            userId: ctvId,
            action: 'CREATE',
            entityType: 'RESERVATION',
            entityId: reservation.id,
            newValue: JSON.stringify(reservation),
          },
        });

        return reservation;
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    ).then(async (reservation) => {
      // Optionally notify CTV about successful reservation (outside transaction)
      await this.notificationsService.createNotification({
        userId: ctvId,
        type: 'RESERVATION_CREATED',
        title: 'Giữ chỗ thành công',
        message: `Bạn đã giữ chỗ thành công căn ${reservation.unit.code}. Vị trí trong hàng chờ: #${priority}.`,
        entityType: 'RESERVATION',
        entityId: reservation.id,
        metadata: {
          reservationId: reservation.id,
          unitId: reservation.unit.id,
          unitCode: reservation.unit.code,
          projectId: reservation.unit.projectId,
        },
      });

      return {
        ...reservation,
        message: `Giữ chỗ thành công! Bạn đang ở vị trí #${priority} trong hàng chờ`,
      };
    });
  }

  /**
   * Get my reservations (CTV)
   */
  async getMyReservations(ctvId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { 
        ctvId,
        deletedAt: null, // Exclude soft-deleted
      },
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
   * Get all reservations (Admin) with pagination
   */
  async findAll(
    filters?: { status?: string; projectId?: string },
    pagination?: PaginationOptions
  ): Promise<PaginationResult<Prisma.ReservationGetPayload<{ include: ReturnType<typeof QueryOptimizerUtil.buildReservationInclude> }>>> {
    const where: Prisma.ReservationWhereInput = {
      deletedAt: null, // Exclude soft-deleted
    };

    if (filters?.status) {
      // Cast string to enum value - Prisma WhereInput accepts enum values directly
      where.status = filters.status as ReservationStatus;
    }

    if (filters?.projectId) {
      where.unit = {
        projectId: filters.projectId,
        deletedAt: null, // Exclude soft-deleted units
      };
    }

    // Normalize pagination
    const { page, pageSize, skip, take } = PaginationUtil.normalize(pagination);

    // Optimized include to prevent N+1 queries
    const include = QueryOptimizerUtil.buildReservationInclude();

    // Use transaction to get count and items in parallel
    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        include,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return PaginationUtil.createResult(items, total, page, pageSize);
  }

  /**
   * Get reservation by ID
   */
  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
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
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(ErrorMessages.RESERVATION.NOT_FOUND);
    }

    return reservation;
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
      throw new NotFoundException(ErrorMessages.RESERVATION.NOT_FOUND);
    }

    // Validate CTV ownership or admin role
    await this.validateCTVOwnershipOrAdmin(reservation.ctvId, userId);

    // Validate status transition
    this.validateStatusTransition(reservation.status, 'CANCELLED');

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

    // Sync unit status (non-critical: log error but don't fail operation)
    // Unit status sync is best-effort - manual cleanup can be used if auto-sync fails
    await this.unitsService.syncUnitStatus(reservation.unitId).catch((error) => {
      this.handleNonCriticalError('syncUnitStatus', error, { unitId: reservation.unitId, action: 'cancel' });
    });

    return { message: 'Hủy giữ chỗ thành công' };
  }

  /**
   * CRONJOB: Auto-expire reservations that passed reservedUntil
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processExpiredReservations() {
    const now = new Date();

    // Find reservations that expired (reservedUntil passed)
    const expired = await this.prisma.reservation.findMany({
      where: {
        status: { in: ['ACTIVE', 'YOUR_TURN'] },
        reservedUntil: {
          lt: now,
        },
        deletedAt: null, // Exclude soft-deleted
      },
      include: {
        unit: true,
        ctv: {
          select: {
            id: true,
          },
        },
      },
    });

    for (const reservation of expired) {
      // Validate status transition
      this.validateStatusTransition(reservation.status, 'EXPIRED');

      // Update to EXPIRED
      await this.prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'EXPIRED' },
      });

      // If it was YOUR_TURN, move to next in queue
      if (reservation.status === 'YOUR_TURN') {
        await this.moveToNextInQueue(reservation.unitId);
      }

      // Sync unit status (non-critical: log error but don't fail operation)
      await this.unitsService.syncUnitStatus(reservation.unitId).catch((error) => {
        this.handleNonCriticalError('syncUnitStatus', error, { unitId: reservation.unitId, action: 'expire' });
      });

      // Notify owner
      if (reservation.ctv) {
        await this.notificationsService.notifyReservationExpired(reservation.ctv.id, {
          reservationId: reservation.id,
          unitCode: reservation.unit.code,
        });
      }

      // Audit log
      await this.prisma.auditLog.create({
        data: {
          action: 'AUTO_EXPIRE',
          entityType: 'RESERVATION',
          entityId: reservation.id,
        },
      });
    }

    return { processed: expired.length };
  }

  /**
   * CRONJOB: Process missed turns (YOUR_TURN → MISSED after deadline)
   * Runs every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async processMissedTurns() {
    const now = new Date();

    // Find reservations that missed their turn
    const missed = await this.prisma.reservation.findMany({
      where: {
        status: 'YOUR_TURN',
        depositDeadline: {
          lt: now,
        },
        deletedAt: null, // Exclude soft-deleted
      },
      include: {
        unit: true,
        ctv: {
          select: { id: true },
        },
      },
    });

    for (const reservation of missed) {
      // Validate status transition (should be YOUR_TURN → MISSED)
      this.validateStatusTransition(reservation.status, 'MISSED');

      // Update to MISSED
      await this.prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'MISSED' },
      });

      // Move to next CTV in queue
      await this.moveToNextInQueue(reservation.unitId);

      // Notify owner that they missed their turn
      if (reservation.ctv) {
        await this.notificationsService.createNotification({
          userId: reservation.ctv.id,
          type: 'RESERVATION_MISSED',
          title: 'Bạn đã lỡ lượt đặt cọc',
          message: `Bạn đã lỡ lượt đặt cọc cho căn ${reservation.unit.code}. Hệ thống sẽ ưu tiên CTV tiếp theo trong hàng chờ.`,
          entityType: 'RESERVATION',
          entityId: reservation.id,
          metadata: {
            reservationId: reservation.id,
            unitId: reservation.unitId,
            unitCode: reservation.unit.code,
          },
        });
      }
    }

    return { processed: missed.length };
  }

  /**
   * Move to next CTV in queue for a unit
   * 
   * CRITICAL: Uses transaction protection to prevent race conditions
   * - Prevents multiple CTVs from getting YOUR_TURN simultaneously
   * - Checks unit status to ensure queue processing is still valid
   * - Atomic operation: find + update in single transaction
   */
  private async moveToNextInQueue(unitId: string): Promise<void> {
    type QueueResult = {
      reservationId: string;
      ctvId?: string | null;
      unitCode: string;
    } | null;

    const result = await this.prisma.$transaction(
      async (tx): Promise<QueueResult> => {
        // Lock unit row by fetching it (transaction isolation provides lock)
        const unit = await tx.unit.findUnique({
          where: { id: unitId },
          select: {
            id: true,
            status: true,
            code: true,
          },
        });

        // Check if unit still exists and is in a state that allows queue processing
        // If unit is SOLD or DEPOSITED, queue processing should stop
        if (!unit) {
          // Unit doesn't exist anymore, skip queue processing
          return null;
        }

        if (unit.status !== 'AVAILABLE' && unit.status !== 'RESERVED_BOOKING') {
          // Unit already taken (SOLD, DEPOSITED, etc.), skip queue processing
          return null;
        }

        // Find next active reservation (atomic - within transaction)
        const nextReservation = await tx.reservation.findFirst({
          where: {
            unitId,
            status: 'ACTIVE',
            deletedAt: null, // Exclude soft-deleted
          },
          orderBy: [
            { priority: 'asc' },
            { createdAt: 'asc' },
          ],
          include: {
            ctv: {
              select: { id: true },
            },
          },
        });

        if (!nextReservation) {
          // No more reservations in queue
          return null;
        }

        // Get deposit deadline from config (default 48h)
        const configValues = await this.systemConfigService.getValuesByKeys([
          'reservation_your_turn_deadline_hours',
        ]);
        const deadlineHours =
          typeof configValues.reservation_your_turn_deadline_hours === 'number'
            ? (configValues.reservation_your_turn_deadline_hours as number)
            : 48;

        const depositDeadline = new Date();
        depositDeadline.setHours(depositDeadline.getHours() + deadlineHours);

        // Validate status transition (should be ACTIVE → YOUR_TURN)
        this.validateStatusTransition(nextReservation.status, 'YOUR_TURN');

        // Update to YOUR_TURN (atomic - within transaction)
        await tx.reservation.update({
          where: { id: nextReservation.id },
          data: {
            status: 'YOUR_TURN',
            notifiedAt: new Date(),
            depositDeadline,
          },
        });

        // Return reservation info for notification (outside transaction)
        return {
          reservationId: nextReservation.id,
          ctvId: nextReservation.ctv?.id,
          unitCode: unit.code,
        };
      },
      {
        isolationLevel: 'Serializable', // Highest isolation level to prevent race conditions
        timeout: 10000, // 10s timeout
      },
    );

    // Send notification outside transaction (fire and forget to avoid blocking)
    if (result && result.ctvId) {
      this.notificationsService
        .notifyReservationYourTurn(result.ctvId, {
          reservationId: result.reservationId,
          unitCode: result.unitCode,
        })
        .catch((error) => {
          // Non-critical: notification failure shouldn't affect queue processing
          this.handleNonCriticalError('notifyReservationYourTurn', error, { reservationId: result.reservationId });
        });
    }
  }
}

