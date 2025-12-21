import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, BookingStatus } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { CodeGeneratorService, CodeType } from '../common/services/code-generator.service';
import { ErrorMessages } from '../../common/constants/error-messages';
import { PaginationUtil, PaginationOptions, PaginationResult } from '../../common/utils/pagination.util';
import { QueryOptimizerUtil } from '../../common/utils/query-optimizer.util';
import { UnitsService } from '../units/units.service';

// Type for unit with project included
type UnitWithProject = Prisma.UnitGetPayload<{
  include: { project: true };
}>;

@Injectable()
export class BookingsService {
  /**
   * Valid status transitions for bookings
   * Maps current status to array of allowed next statuses
   */
  private static readonly VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
    PENDING_PAYMENT: ['PENDING_APPROVAL', 'CANCELLED', 'EXPIRED'],
    PENDING_APPROVAL: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    CONFIRMED: ['CANCELLED', 'UPGRADED'], // Can cancel or upgrade to deposit
    CANCELLED: [], // Terminal state - no further transitions
    EXPIRED: [], // Terminal state - no further transitions
    UPGRADED: [], // Terminal state - upgraded to deposit
  };

  /**
   * Validate booking status transition
   * @throws BadRequestException if transition is invalid
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const allowedTransitions = BookingsService.VALID_STATUS_TRANSITIONS[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
        `Allowed transitions from ${currentStatus}: ${allowedTransitions.join(', ') || 'none (terminal state)'}`
      );
    }
  }

  /**
   * Validate unit is available for booking or has valid reservation
   * @throws BadRequestException if unit is not available
   */
  private validateUnitAvailableForBooking(
    unit: { status: string; id: string },
    hasValidReservation: boolean,
  ): void {
    if (unit.status === 'SOLD') {
      throw new BadRequestException(ErrorMessages.UNIT.ALREADY_SOLD);
    }

    if (unit.status === 'DEPOSITED') {
      throw new BadRequestException(ErrorMessages.UNIT.ALREADY_DEPOSITED);
    }

    if (unit.status === 'AVAILABLE') {
      return; // OK
    }

    if (unit.status === 'RESERVED_BOOKING' && hasValidReservation) {
      return; // OK: booking được nâng cấp từ reservation hợp lệ
    }

    // Otherwise, unit is not available
    throw new ConflictException(ErrorMessages.UNIT.ALREADY_RESERVED);
  }

  /**
   * Validate project status for booking (must be OPEN unless upgrading from reservation)
   * @throws BadRequestException if project status is invalid
   */
  private validateProjectStatusForBooking(
    project: { status: string; id: string },
    isUpgradingFromReservation: boolean,
  ): void {
    if (project.status === 'OPEN') {
      return; // OK
    }

    if (isUpgradingFromReservation && project.status === 'UPCOMING') {
      return; // OK: upgrading from reservation allows UPCOMING projects
    }

        throw new BadRequestException(ErrorMessages.PROJECT.NOT_OPEN);
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
   * @param context Additional context for logging (entityId, bookingId, etc.)
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
   * Get booking amount from SystemConfig
   * Keys:
   * - booking_amount_type: "fixed" | "percentage"
   * - booking_amount_fixed: number
   * - booking_amount_percentage: number
   */
  private async getBookingAmount(): Promise<number> {
    const keys = [
      'booking_amount_type',
      'booking_amount_fixed',
      'booking_amount_percentage',
    ];
    const values = await this.systemConfigService.getValuesByKeys(keys);

    const type = (values.booking_amount_type as string) || 'fixed';
    const fixed = (values.booking_amount_fixed as number) || 10000000;
    const percentage = (values.booking_amount_percentage as number) || 0;

    if (type === 'percentage' && percentage > 0) {
      // Percentage booking amount will be calculated on FE based on unit price if needed.
      // On backend we still need a snapshot number, so we fallback to fixed if we don't have unit price here.
      return fixed;
    }

    return fixed;
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
      throw new NotFoundException(ErrorMessages.UNIT.NOT_FOUND);
    }

    // Validate project status
    this.validateProjectStatusForBooking(unit.project, !!dto.reservationId);

    // If upgrading from reservation, validate
    let hasValidReservation = false;
    if (dto.reservationId) {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
      });

      if (!reservation) {
        throw new NotFoundException(ErrorMessages.RESERVATION.NOT_FOUND);
      }

      // Validate CTV ownership
      if (reservation.ctvId !== ctvId) {
        throw new ForbiddenException(ErrorMessages.RESERVATION.NOT_OWNER);
      }

      if (reservation.status !== 'YOUR_TURN' && reservation.status !== 'ACTIVE') {
        throw new BadRequestException(ErrorMessages.RESERVATION.INVALID_STATUS);
      }

      hasValidReservation = true;
    }

    // Use transaction to prevent race condition
    return await this.createBookingWithTransaction(dto, ctvId, hasValidReservation, unit);
  }

  /**
   * Create booking with transaction protection (prevents race condition)
   * @param _unit Pre-fetched unit for validation, but we re-fetch in transaction for atomicity
   */
  private async createBookingWithTransaction(
    dto: CreateBookingDto,
    ctvId: string,
    hasValidReservation: boolean,
    _unit: UnitWithProject, // Pre-fetched unit for validation, but we re-fetch in transaction for atomicity
  ) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
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

            // CRITICAL: Check for existing active booking/deposit (atomic)
            const existingBooking = await tx.booking.findFirst({
              where: {
                unitId: dto.unitId,
                status: { in: ['PENDING_PAYMENT', 'PENDING_APPROVAL', 'CONFIRMED'] },
                deletedAt: null,
              },
            });

            if (existingBooking && existingBooking.ctvId !== ctvId) {
              throw new ConflictException(ErrorMessages.BOOKING.ALREADY_EXISTS);
            }

            const existingDeposit = await tx.deposit.findFirst({
              where: {
                unitId: dto.unitId,
                status: { in: ['PENDING_APPROVAL', 'CONFIRMED'] },
                deletedAt: null,
              },
            });

            if (existingDeposit) {
              throw new ConflictException(ErrorMessages.UNIT.ALREADY_DEPOSITED);
            }

            // Validate unit is available for booking (atomic - within transaction)
            this.validateUnitAvailableForBooking(currentUnit, hasValidReservation);

            // Get booking amount from config
            const bookingAmount = await this.getBookingAmount();

            // Generate code: BK000001, BK000002, ... (within transaction to prevent race condition)
            const code = await this.codeGenerator.generateCode(CodeType.BOOKING, tx);

            // Calculate expires at using booking_duration_hours from SystemConfig
            const bookingDurationValues = await this.systemConfigService.getValuesByKeys([
              'booking_duration_hours',
            ]);
            const bookingDurationHours =
              typeof bookingDurationValues.booking_duration_hours === 'number'
                ? (bookingDurationValues.booking_duration_hours as number)
                : 48;
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + bookingDurationHours);

            // Determine status based on payment proof
            const status = dto.paymentProof && dto.paymentProof.length > 0 
              ? 'PENDING_APPROVAL' 
              : 'PENDING_PAYMENT';

            // Create booking (atomic)
            const booking = await tx.booking.create({
              data: {
                code,
                unitId: dto.unitId,
                ctvId,
                customerName: dto.customerName,
                customerPhone: dto.customerPhone,
                customerEmail: dto.customerEmail,
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

            // Update unit status (atomic - within same transaction)
            await tx.unit.update({
              where: { id: dto.unitId },
              data: { status: 'RESERVED_BOOKING' },
            });

            // If from reservation, mark as COMPLETED
            if (dto.reservationId) {
              // Get current reservation status to validate transition
              const reservation = await tx.reservation.findUnique({
                where: { id: dto.reservationId },
                select: { status: true },
              });

              if (reservation) {
                // Validate status transition: ACTIVE/YOUR_TURN → COMPLETED
                const validFromStatuses = ['ACTIVE', 'YOUR_TURN'];
                if (!validFromStatuses.includes(reservation.status)) {
                  throw new BadRequestException(
                    `Cannot complete reservation: Invalid status ${reservation.status}. ` +
                    `Reservation must be ACTIVE or YOUR_TURN to complete.`
                  );
                }

                await tx.reservation.update({
                  where: { id: dto.reservationId },
                  data: { status: 'COMPLETED' },
                });
              }
            }

            // Audit log
            await tx.auditLog.create({
              data: {
                userId: ctvId,
                action: 'CREATE',
                entityType: 'BOOKING',
                entityId: booking.id,
                newValue: JSON.stringify(booking),
              },
            });

            return booking;
          },
          {
            isolationLevel: 'Serializable',
            timeout: 15000,
          }
        ).then(async (booking) => {
          // Send notification outside transaction
          this.notificationsService.notifyBookingStatus(ctvId, {
            bookingId: booking.id,
            unitCode: booking.unit.code,
            status: 'CREATED',
          }).catch((error) => {
            this.handleNonCriticalError('notifyBookingStatus', error, { bookingId: booking.id, status: 'CREATED' });
          });

          return {
            ...booking,
            message: booking.status === 'PENDING_APPROVAL' 
              ? 'Tạo booking thành công! Chờ admin duyệt' 
              : 'Tạo booking thành công! Vui lòng thanh toán',
          };
        });
      } catch (error: unknown) {
        attempt++;
        
        // Check if it's a conflict/race condition error (Prisma P2034 = transaction conflict)
        const isConflictError = 
          (error instanceof Error && 'code' in error && error.code === 'P2034') ||
          (error instanceof Error && (
            error.message?.includes('conflict') || 
            error.message?.includes('already') ||
            error.message?.includes('serialization')
          ));
        
        // Retry on conflict errors with exponential backoff
        if (isConflictError && attempt < maxRetries) {
          const backoffMs = 50 * Math.pow(2, attempt - 1); // 50ms, 100ms, 200ms
          console.warn(`[Retry ${attempt}/${maxRetries}] Booking creation conflict, retrying after ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
        
        // Log and throw other errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[CRITICAL] Booking creation failed after ${attempt} attempts:`, errorMessage);
        if (error instanceof Error && error.stack) {
          console.error(error.stack);
        }
        throw error;
      }
    }
  }

  /**
   * Admin approve booking
   */
  async approve(id: string, adminId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        unit: {
          select: { code: true },
        },
        ctv: {
          select: { id: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(ErrorMessages.BOOKING.NOT_FOUND);
    }

    if (booking.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException(ErrorMessages.BOOKING.ALREADY_PROCESSED);
    }

    // Validate status transition
    this.validateStatusTransition(booking.status, 'CONFIRMED');

    // Wrap in transaction to ensure atomicity
    return await this.prisma.$transaction(
      async (tx) => {
        // Update booking (atomic)
        await tx.booking.update({
          where: { id },
          data: {
            status: 'CONFIRMED',
            approvedBy: adminId,
            approvedAt: new Date(),
          },
        });

        // Audit log (atomic)
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'APPROVE',
            entityType: 'BOOKING',
            entityId: id,
          },
        });

        // Notify booking owner (non-critical: fire and forget)
        if (booking.ctv) {
          this.notificationsService.notifyBookingStatus(booking.ctv.id, {
            bookingId: booking.id,
            unitCode: booking.unit.code,
            status: 'APPROVED',
          }).catch((error) => {
            this.handleNonCriticalError('notifyBookingStatus', error, { bookingId: booking.id, status: 'APPROVED' });
          });
        }

        return { message: 'Duyệt booking thành công' };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 5000,
      }
    );
  }

  /**
   * Admin reject booking
   */
  async reject(id: string, adminId: string, reason: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        unit: true,
        ctv: {
          select: { id: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(ErrorMessages.BOOKING.NOT_FOUND);
    }

    // Validate status transition
    this.validateStatusTransition(booking.status, 'CANCELLED');

    // Wrap in transaction to ensure atomicity (booking update + unit release)
    return await this.prisma.$transaction(
      async (tx) => {
        // Update booking (atomic)
        await tx.booking.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelledReason: reason,
          },
        });

        // Unit status will be synced after transaction to avoid circular dependency

        // Audit log (atomic)
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'REJECT',
            entityType: 'BOOKING',
            entityId: id,
            newValue: JSON.stringify({ reason }),
          },
        });

        return { message: 'Từ chối booking thành công', booking };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    ).then(async (booking) => {
      // Sync unit status (non-critical: log error but don't fail operation)
      await this.unitsService.syncUnitStatus(booking.unitId).catch((error) => {
        this.handleNonCriticalError('syncUnitStatus', error, { unitId: booking.unitId, action: 'reject' });
      });

      // Notify booking owner (non-critical: fire and forget)
      if (booking.ctv) {
        this.notificationsService.notifyBookingStatus(booking.ctv.id, {
          bookingId: booking.id,
          unitCode: booking.unit.code,
          status: 'REJECTED',
        }).catch((error) => {
          this.handleNonCriticalError('notifyBookingStatus', error, { bookingId: booking.id, status: 'REJECTED' });
        });
      }

      return { message: 'Từ chối booking thành công' };
    });
  }

  /**
   * Cancel booking (CTV or Admin)
   */
  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        unit: true,
        ctv: {
          select: { id: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(ErrorMessages.BOOKING.NOT_FOUND);
    }

    // Validate CTV ownership or admin role
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.validateCTVOwnershipOrAdmin(booking.ctvId, userId, user?.role);

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

    // Notify booking owner
    if (booking.ctv) {
      await this.notificationsService.notifyBookingStatus(booking.ctv.id, {
        bookingId: booking.id,
        unitCode: booking.unit.code,
        status: 'CANCELLED',
      });
    }

    return { 
      message: 'Hủy booking thành công',
      refundAmount,
    };
  }

  /**
   * Get all bookings (Admin)
   */
  async findAll(
    filters?: { status?: string; projectId?: string; ctvId?: string },
    pagination?: PaginationOptions
  ): Promise<PaginationResult<Prisma.BookingGetPayload<{ include: ReturnType<typeof QueryOptimizerUtil.buildBookingInclude> }>>> {
    const where: Prisma.BookingWhereInput = {
      deletedAt: null, // Exclude soft-deleted
    };

    if (filters?.status) {
      // Cast string to enum value - Prisma WhereInput accepts enum values directly
      where.status = filters.status as BookingStatus;
    }

    if (filters?.projectId) {
      where.unit = { 
        projectId: filters.projectId,
        deletedAt: null, // Exclude soft-deleted units
      };
    }

    if (filters?.ctvId) {
      where.ctvId = filters.ctvId;
    }

    // Normalize pagination
    const { page, pageSize, skip, take } = PaginationUtil.normalize(pagination);

    // Optimized include to prevent N+1 queries
    const include = QueryOptimizerUtil.buildBookingInclude();

    // Execute queries in parallel without transaction (simpler and avoids extension conflicts)
    // Both queries already have deletedAt filter in where clause
    // Use extended client - extension will skip adding deletedAt since we already have it
    let bookings, total;
    try {
      [bookings, total] = await Promise.all([
        this.prisma.booking.findMany({
          where,
          include,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take,
        }),
        this.prisma.booking.count({ where }),
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[CRITICAL] BookingsService.findAll query error:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
      console.error('Where clause:', JSON.stringify(where, null, 2));
      throw error; // Re-throw to let NestJS error filter handle it
    }

    // Parse paymentProof
    const items = bookings.map((b) => {
      try {
        return {
          ...b,
          paymentProof: b.paymentProof ? JSON.parse(b.paymentProof) : [],
        };
      } catch (parseError: unknown) {
        // Non-critical: continue with empty paymentProof array
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        console.warn(`[Non-critical] Error parsing paymentProof for booking ${b.id}: ${errorMessage}`);
        return {
          ...b,
          paymentProof: [],
        };
      }
    });

    return PaginationUtil.createResult(items, total, page, pageSize);
  }

  /**
   * Update payment proof (Admin) - allow upload/change after creation
   * @param paymentProof Array of file URLs or null to clear
   */
  async updatePaymentProof(id: string, adminId: string, paymentProof: string[] | null) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(ErrorMessages.BOOKING.NOT_FOUND);
    }

    const oldValue = booking.paymentProof ? JSON.parse(booking.paymentProof) : null;

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        paymentProof: paymentProof ? JSON.stringify(paymentProof) : null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_PAYMENT_PROOF',
        entityType: 'BOOKING',
        entityId: id,
        oldValue: JSON.stringify({ paymentProof: oldValue }),
        newValue: JSON.stringify({ paymentProof }),
      },
    });

    return {
      message: 'Cập nhật chứng từ thanh toán thành công',
      booking: {
        ...updated,
        paymentProof,
      },
    };
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
   *
   * Business rule:
   * - Khi booking hết hạn: chuyển status → EXPIRED
   * - Unit status sẽ được tự động sync thông qua syncUnitStatus():
   *   - Nếu unit KHÔNG có active reservations/bookings khác → Unit status = AVAILABLE (auto-release)
   *   - Nếu unit CÓ active reservations/bookings khác → Unit status giữ nguyên RESERVED_BOOKING
   * - Manual cleanup (via cleanup() method) vẫn cần thiết cho edge cases:
   *   - Review/audit trước khi release
   *   - Unit có nhiều expired bookings cần xử lý cùng lúc
   *   - Edge cases khác cần human oversight
   */
  async processExpiredBookings() {
    try {
      const now = new Date();

      const expired = await this.prisma.booking.findMany({
        where: {
          status: { in: ['PENDING_PAYMENT', 'PENDING_APPROVAL'] },
          expiresAt: {
            lt: now,
          },
          deletedAt: null, // Exclude soft-deleted
        },
      });

      let processed = 0;
      const errors: string[] = [];

      for (const booking of expired) {
        try {
          // Validate status transition
          this.validateStatusTransition(booking.status, 'EXPIRED');

          // Update to EXPIRED
          await this.prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'EXPIRED' },
          });

          // Auto-sync unit status (non-critical: log error but don't fail operation)
          // Manual cleanup via cleanup() can be used if auto-sync fails
          await this.unitsService.syncUnitStatus(booking.unitId).catch((error) => {
            this.handleNonCriticalError('syncUnitStatus', error, { unitId: booking.unitId, action: 'expire', bookingId: booking.id });
          });

          // Audit log
          await this.prisma.auditLog.create({
            data: {
              action: 'AUTO_EXPIRE',
              entityType: 'BOOKING',
              entityId: booking.id,
            },
          });

          processed++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Booking ${booking.id}: ${errorMessage}`);
          this.handleNonCriticalError('processExpiredBooking', error, { bookingId: booking.id });
        }
      }

      return {
        processed,
        total: expired.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[CRITICAL] Error in processExpiredBookings:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
      throw new Error(`Đã xảy ra lỗi khi kiểm tra booking hết hạn: ${errorMessage}`);
    }
  }

  /**
   * Get bookings in "trash" (EXPIRED or CANCELLED) that are still locking units
   * 
   * Admin sẽ dùng danh sách này để dọn rác và trả căn về AVAILABLE.
   * 
   * Note: Most expired bookings will auto-release via syncUnitStatus() in processExpiredBookings().
   * This method is useful for:
   * - Manual review/audit before release
   * - Edge cases where auto-sync didn't release (multiple expired bookings, etc.)
   * - Human oversight for critical units
   */
  async findTrash() {
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { in: ['EXPIRED', 'CANCELLED'] },
        unit: {
          status: 'RESERVED_BOOKING',
        },
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return bookings.map((b) => ({
      ...b,
      paymentProof: b.paymentProof ? JSON.parse(b.paymentProof) : [],
    }));
  }

  /**
   * Cleanup booking: release unit back to AVAILABLE
   * 
   * Manual cleanup method for expired/cancelled bookings.
   * 
   * When to use:
   * - Most expired bookings auto-release via syncUnitStatus() in processExpiredBookings()
   * - Use this for manual review/audit before release
   * - Use this for edge cases where auto-sync didn't work (e.g., multiple expired bookings)
   * - Use this when human oversight is needed for critical units
   * 
   * Business rules:
   * - Chỉ cho phép với booking EXPIRED hoặc CANCELLED
   * - Unit hiện đang ở trạng thái RESERVED_BOOKING
   * - Sync unit status sẽ check tất cả reservations/bookings và release nếu không có active ones
   */
  async cleanup(id: string, adminId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        unit: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(ErrorMessages.BOOKING.NOT_FOUND);
    }

    if (!['EXPIRED', 'CANCELLED'].includes(booking.status)) {
      throw new BadRequestException(ErrorMessages.BOOKING.CANNOT_CLEANUP);
    }

    if (!booking.unit) {
      throw new NotFoundException(ErrorMessages.BOOKING.UNIT_NOT_FOUND);
    }

    // Chỉ trả về AVAILABLE nếu unit đang ở trạng thái RESERVED_BOOKING
    if (booking.unit.status !== 'RESERVED_BOOKING') {
      throw new BadRequestException(ErrorMessages.UNIT.STATUS_MISMATCH('RESERVED_BOOKING', booking.unit.status));
    }

    // Wrap in transaction to ensure atomicity
    await this.prisma.$transaction(
      async (tx) => {
        // Mark booking as cleaned up (don't change unit status here, syncUnitStatus will handle it)
        // We remove the direct unit status update to use syncUnitStatus instead
        
        // Audit log (atomic)
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'CLEANUP',
            entityType: 'BOOKING',
            entityId: booking.id,
            newValue: JSON.stringify({ releasedUnitId: booking.unitId }),
          },
        });
      },
      {
        isolationLevel: 'Serializable',
        timeout: 5000,
      }
    );

    // Sync unit status (non-critical: log error but don't fail operation)
    await this.unitsService.syncUnitStatus(booking.unitId).catch((error) => {
      this.handleNonCriticalError('syncUnitStatus', error, { unitId: booking.unitId, action: 'cleanup', bookingId: booking.id });
    });

    return { message: 'Đã dọn booking và đồng bộ trạng thái căn' };
  }

  /**
   * Soft delete a booking (set deletedAt)
   * Replaces the old "hidden" marker approach
   */
  async softDelete(id: string, userId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(ErrorMessages.BOOKING.NOT_FOUND);
    }

    if (booking.deletedAt) {
      throw new BadRequestException(ErrorMessages.BOOKING.ALREADY_PROCESSED);
    }

    await this.prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'SOFT_DELETE',
        entityType: 'BOOKING',
        entityId: id,
        oldValue: JSON.stringify({ deletedAt: null }),
        newValue: JSON.stringify({ deletedAt: new Date() }),
      },
    });
  }

  /**
   * Restore a soft-deleted booking
   */
  async restore(id: string, userId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(ErrorMessages.BOOKING.NOT_FOUND);
    }

    if (!booking.deletedAt) {
      throw new BadRequestException(ErrorMessages.BOOKING.ALREADY_PROCESSED);
    }

    await this.prisma.booking.update({
      where: { id },
      data: { deletedAt: null },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'RESTORE',
        entityType: 'BOOKING',
        entityId: id,
      },
    });
  }
}

