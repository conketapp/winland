import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { ProjectStatus, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { BatchOperationsUtil } from '../../common/utils/batch-operations.util';
import { PaginationUtil, PaginationOptions, PaginationResult } from '../../common/utils/pagination.util';
import { ProjectWithCounts, ProjectWithRelations, ProjectStatistics } from './types/project.types';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private systemConfigService: SystemConfigService,
  ) {}

  /**
   * Create a new project
   */
  async create(dto: CreateProjectDto, createdBy: string) {
    // Check if code already exists
    const existing = await this.prisma.project.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Mã dự án "${dto.code}" đã tồn tại`);
    }

    // Validate priceFrom <= priceTo
    if (dto.priceFrom && dto.priceTo && dto.priceFrom > dto.priceTo) {
      throw new BadRequestException('Giá từ phải nhỏ hơn hoặc bằng giá đến');
    }

    // Create project in transaction with audit log
    const project = await this.prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          ...dto,
          amenities: dto.amenities ? JSON.stringify(dto.amenities) : null,
          images: dto.images ? JSON.stringify(dto.images) : null,
          openDate: dto.openDate ? new Date(dto.openDate) : null,
          createdBy,
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: createdBy,
          action: 'CREATE',
          entityType: 'PROJECT',
          entityId: created.id,
          newValue: JSON.stringify({
            name: created.name,
            code: created.code,
            status: created.status,
            developer: created.developer,
            city: created.city,
            location: created.location,
          }),
        },
      });

      return created;
    });

    return project;
  }

  /**
   * Get all projects with filters and pagination
   */
  async findAll(query: QueryProjectDto): Promise<PaginationResult<ProjectWithCounts>> {
    const { status, city, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null, // Exclude soft-deleted projects
    };

    if (status) {
      where.status = status;
    }

    if (city) {
      where.city = city;
    }

    if (search) {
      // SQLite doesn't support case-insensitive mode, use contains only
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    // Normalize pagination options
    const paginationOptions: PaginationOptions = {
      page: query.page,
      pageSize: query.pageSize,
      maxPageSize: 100, // Max 100 projects per page
    };
    const { page, pageSize, skip, take } = PaginationUtil.normalize(paginationOptions);

    // Build orderBy with type safety
    const orderBy: Prisma.ProjectOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    } as Prisma.ProjectOrderByWithRelationInput;

    // Get items and total count in parallel (optimized)
    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              buildings: true,
              units: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.project.count({ where }),
    ]);

    // Map _count into convenient aggregate fields expected by FE (totalUnits/totalBuildings)
    const items: ProjectWithCounts[] = projects.map((project) => ({
      ...project,
      totalUnits: project._count?.units ?? project.totalUnits ?? 0,
      totalBuildings: project._count?.buildings ?? project.totalBuildings ?? 0,
    }));

    // Return paginated result
    return PaginationUtil.createResult(items, total, page, pageSize);
  }

  /**
   * Get project by ID
   */
  async findOne(id: string): Promise<ProjectWithRelations> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        buildings: {
          include: {
            floorsData: {
              orderBy: {
                number: 'asc',
              },
            },
            _count: {
              select: {
                floorsData: true,
                units: true,
              },
            },
          },
        },
        _count: {
          select: {
            units: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Parse JSON fields
    return {
      ...project,
      amenities: project.amenities ? JSON.parse(project.amenities) : [],
      images: project.images ? JSON.parse(project.images) : [],
    };
  }

  /**
   * Update project
   */
  async update(id: string, dto: UpdateProjectDto, userId: string) {
    // Get old project data for audit log
    const oldProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!oldProject) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Check code uniqueness if changing
    if (dto.code && dto.code !== oldProject.code) {
      const existing = await this.prisma.project.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw new ConflictException(`Mã dự án "${dto.code}" đã tồn tại`);
      }
    }

    // Validate priceFrom <= priceTo when updating
    if (dto.priceFrom && dto.priceTo && dto.priceFrom > dto.priceTo) {
      throw new BadRequestException('Giá từ phải nhỏ hơn hoặc bằng giá đến');
    }

    // Update project in transaction with audit log
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          ...dto,
          amenities: dto.amenities ? JSON.stringify(dto.amenities) : undefined,
          images: dto.images ? JSON.stringify(dto.images) : undefined,
          openDate: dto.openDate ? new Date(dto.openDate) : undefined,
        },
      });

      // Create audit log with old and new values
      const changes: Record<string, { old: unknown; new: unknown }> = {};
      
      // Track changed fields
      Object.keys(dto).forEach((key) => {
        const oldValue = (oldProject as Record<string, unknown>)[key];
        const newValue = (updatedProject as Record<string, unknown>)[key];
        
        // Only log if value actually changed
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes[key] = { old: oldValue, new: newValue };
        }
      });

      // Only create audit log if there are actual changes
      if (Object.keys(changes).length > 0) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'UPDATE',
            entityType: 'PROJECT',
            entityId: id,
            oldValue: JSON.stringify({
              name: oldProject.name,
              code: oldProject.code,
              status: oldProject.status,
              developer: oldProject.developer,
              city: oldProject.city,
              ...Object.fromEntries(
                Object.entries(changes).map(([key, values]) => [key, values.old])
              ),
            }),
            newValue: JSON.stringify({
              name: updatedProject.name,
              code: updatedProject.code,
              status: updatedProject.status,
              developer: updatedProject.developer,
              city: updatedProject.city,
              ...Object.fromEntries(
                Object.entries(changes).map(([key, values]) => [key, values.new])
              ),
            }),
          },
        });
      }

      return updatedProject;
    });

    return updated;
  }

  /**
   * Change project status (UPCOMING → OPEN → CLOSED)
   * CRITICAL: When OPEN, trigger reservation queue processing
   */
  async changeStatus(id: string, newStatus: ProjectStatus) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        units: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Business rule: Can only go forward
    const statusOrder = ['UPCOMING', 'OPEN', 'CLOSED'];
    const currentIndex = statusOrder.indexOf(project.status);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex < currentIndex) {
      throw new BadRequestException(`Không thể chuyển từ ${project.status} về ${newStatus}`);
    }

    // Business rule: When opening, project must have at least 1 AVAILABLE unit
    if (newStatus === ProjectStatus.OPEN) {
      if (!project.units || project.units.length === 0) {
        throw new BadRequestException('Dự án chưa có căn, không thể mở bán');
      }

      // Check if there's at least 1 AVAILABLE unit
      const availableUnits = project.units.filter((unit) => unit.status === 'AVAILABLE');
      if (availableUnits.length === 0) {
        const unitStatusCounts = project.units.reduce((acc, unit) => {
          acc[unit.status] = (acc[unit.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const statusSummary = Object.entries(unitStatusCounts)
          .map(([status, count]) => `${status}: ${count}`)
          .join(', ');

        throw new BadRequestException(
          `Dự án không có căn AVAILABLE để mở bán. ` +
          `Tổng số căn: ${project.units.length}. ` +
          `Trạng thái: ${statusSummary}. ` +
          `Vui lòng thêm căn AVAILABLE trước khi mở bán.`
        );
      }
    }

    // Update project status
    const updated = await this.prisma.project.update({
      where: { id },
      data: { status: newStatus },
    });

    // 🔥 CRITICAL: If changing to OPEN, process reservation queues
    // Run asynchronously to avoid blocking API response
    if (newStatus === ProjectStatus.OPEN && project.status === ProjectStatus.UPCOMING) {
      // Fire and forget - process in background
      // This prevents API timeout for large projects
      this.processReservationQueues(id).catch((error) => {
        console.error(`[Queue Processing] Failed to process queues for project ${id}:`, error);
        // TODO: Send notification to admin about queue processing failure
      });
    }

    return updated;
  }

  /**
   * 🔥 CRITICAL BUSINESS LOGIC: Process reservation queues when project opens
   * This notifies the first CTV in queue for each unit
   * 
   * OPTIMIZED: Uses batch processing to handle large projects efficiently
   * - Processes units in parallel batches (configurable concurrency)
   * - Tracks errors for retry
   * - Non-blocking: Runs asynchronously to avoid API timeout
   * 
   * Edge cases handled:
   * - Unit already DEPOSITED/SOLD (skip queue processing)
   * - Multiple reservations in queue (process sequentially)
   * - Race condition: Unit status changed during processing
   * - Transaction safety: All operations in transaction
   */
  private async processReservationQueues(projectId: string) {
    // Get all AVAILABLE units in this project (with lock to prevent race condition)
    const units = await this.prisma.$transaction(
      async (tx) => {
        // Use SELECT FOR UPDATE to lock rows (SQLite doesn't support, but PostgreSQL does)
        // For SQLite, we rely on transaction isolation
        return await tx.unit.findMany({
          where: {
            projectId,
            status: 'AVAILABLE',
          },
          select: {
            id: true, // Only select id to reduce data transfer
          },
        });
      },
      {
        isolationLevel: 'Serializable', // Highest isolation level
        timeout: 30000, // 30s timeout
      }
    );

    if (units.length === 0) {
      console.log(`[Queue Processing] No AVAILABLE units found for project ${projectId}`);
      return;
    }

    console.log(`[Queue Processing] Starting queue processing for ${units.length} units in project ${projectId}`);

    // Get batch configuration from SystemConfig (with defaults)
    const configValues = await this.systemConfigService.getValuesByKeys([
      'queue_processing_batch_size',
      'queue_processing_concurrency',
    ]);
    
    const BATCH_SIZE = typeof configValues.queue_processing_batch_size === 'number'
      ? (configValues.queue_processing_batch_size as number)
      : 20; // Default: 20 units per batch
    
    const CONCURRENCY = typeof configValues.queue_processing_concurrency === 'number'
      ? (configValues.queue_processing_concurrency as number)
      : 5; // Default: 5 parallel batches

    // Track processing results
    const results = {
      total: units.length,
      processed: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ unitId: string; error: string }>,
    };

    try {
      // Process units in parallel batches
      await BatchOperationsUtil.processInParallelBatches(
        units,
        BATCH_SIZE,
        CONCURRENCY,
        async (batch: Array<{ id: string }>) => {
          // Process each unit in the batch
          const batchResults = await Promise.allSettled(
            batch.map((unit) => this.processUnitQueue(unit.id))
          );

          // Track results
          batchResults.forEach((result, index) => {
            const unit = batch[index];
            if (result.status === 'fulfilled') {
              const value = result.value;
              // Check if unit was skipped (no reservations, wrong status, etc.)
              if (value && typeof value === 'object' && 'skipped' in value && value.skipped) {
                results.skipped++;
                console.log(`[Queue Processing] Skipped unit ${unit.id}: ${value.reason || 'Unknown reason'}`);
              } else {
                // Successfully processed
                results.processed++;
              }
            } else {
              // Failed with error
              results.failed++;
              results.errors.push({
                unitId: unit.id,
                error: result.reason?.message || String(result.reason),
              });
              console.error(`[Queue Processing] Failed to process unit ${unit.id}:`, result.reason);
            }
          });
          
          // Return empty array to satisfy type requirement
          return [];

          // Log progress
          const completed = results.processed + results.failed + results.skipped;
          const progress = (completed / results.total * 100).toFixed(1);
          console.log(
            `[Queue Processing] Progress: ${completed}/${results.total} (${progress}%) - ` +
            `Processed: ${results.processed}, Skipped: ${results.skipped}, Failed: ${results.failed}`
          );
        }
      );

      // Determine final status
      const status =
        results.failed === 0
          ? 'COMPLETED'
          : results.processed === 0
            ? 'FAILED'
            : 'PARTIAL';

      // Get project info for notifications
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      });

      const projectName = project?.name || projectId;

      // Save processing log to database
      try {
        await (this.prisma as any).queueProcessingLog.create({
          data: {
            projectId,
            status,
            totalUnits: results.total,
            processed: results.processed,
            skipped: results.skipped,
            failed: results.failed,
            failedUnits: results.errors.length > 0 ? JSON.stringify(results.errors) : null,
            completedAt: new Date(),
          },
        });
      } catch (logError) {
        console.error(`[Queue Processing] Failed to save log for project ${projectId}:`, logError);
        // Don't throw - logging failure shouldn't block
      }

      // Final summary
      console.log(
        `[Queue Processing] Completed for project ${projectId}: ` +
        `Total: ${results.total}, Processed: ${results.processed}, ` +
        `Failed: ${results.failed}, Skipped: ${results.skipped}, Status: ${status}`
      );

      // Send notifications to admins
      if (results.errors.length > 0) {
        console.warn(
          `[Queue Processing] ${results.errors.length} units failed processing. ` +
          `First 10 errors:`,
          results.errors.slice(0, 10)
        );

        // Send notification to admins about errors
        try {
          await this.notificationsService.notifyAdminQueueProcessingErrors(
            projectId,
            projectName,
            results.errors,
          );
        } catch (notifError) {
          console.error(`[Queue Processing] Failed to send error notification:`, notifError);
          // Don't throw - notification failure shouldn't block
        }
      }

      // Send completion notification if there were failures
      if (results.failed > 0) {
        try {
          await this.notificationsService.notifyAdminQueueProcessingComplete(
            projectId,
            projectName,
            results,
          );
        } catch (notifError) {
          console.error(`[Queue Processing] Failed to send completion notification:`, notifError);
        }
      }
    } catch (error) {
      console.error(`[Queue Processing] Critical error processing queues for project ${projectId}:`, error);

      // Save error log
      try {
        await (this.prisma as any).queueProcessingLog.create({
          data: {
            projectId,
            status: 'FAILED',
            totalUnits: units.length,
            errorMessage: error instanceof Error ? error.message : String(error),
          },
        });
      } catch (logError) {
        console.error(`[Queue Processing] Failed to save error log:`, logError);
      }

      // Send notification to admins about critical error
      try {
        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { name: true },
        });
        await this.notificationsService.notifyAdminQueueProcessingErrors(
          projectId,
          project?.name || projectId,
          [{ unitId: 'ALL', error: error instanceof Error ? error.message : String(error) }],
        );
      } catch (notifError) {
        console.error(`[Queue Processing] Failed to send critical error notification:`, notifError);
      }
    }
  }

  /**
   * Process queue for a single unit (atomic operation)
   */
  private async processUnitQueue(unitId: string) {
    return await this.prisma.$transaction(
      async (tx) => {
        // Re-check unit status (might have changed)
        const unit = await tx.unit.findUnique({
          where: { id: unitId },
          include: { project: true },
        });

        if (!unit) {
          return { skipped: true, reason: 'Unit does not exist' };
        }

        // Edge case: Unit already DEPOSITED/SOLD - mark all reservations as MISSED
        if (unit.status === 'DEPOSITED' || unit.status === 'SOLD') {
          const updatedCount = await tx.reservation.updateMany({
            where: {
              unitId: unitId,
              status: { in: ['ACTIVE', 'YOUR_TURN'] },
            },
            data: { status: 'MISSED' },
          });
          return { 
            skipped: true, 
            reason: `Unit already ${unit.status}`,
            reservationsMarkedMissed: updatedCount.count,
          };
        }

        // Edge case: Unit not AVAILABLE anymore (might be RESERVED_BOOKING)
        if (unit.status !== 'AVAILABLE') {
          // Return status to indicate skip (for tracking)
          return { skipped: true, reason: `Unit status is ${unit.status}` };
        }

        // Find first active reservation (lowest priority, earliest created)
        const firstReservation = await tx.reservation.findFirst({
          where: {
            unitId: unitId,
            status: 'ACTIVE',
          },
          orderBy: [
            { priority: 'asc' },
            { createdAt: 'asc' },
          ],
          include: {
            ctv: {
              select: { id: true },
            },
            unit: {
              select: { code: true },
            },
          },
        });

        if (!firstReservation) {
          // Return status to indicate skip (for tracking)
          return { skipped: true, reason: 'No reservations in queue' };
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

        // Validate status transition: ACTIVE → YOUR_TURN
        if (firstReservation.status !== 'ACTIVE') {
          // Skip if not ACTIVE (might have been changed by another process)
          console.warn(
            `[Queue Processing] Skipping reservation ${firstReservation.id}: ` +
            `Expected status ACTIVE, got ${firstReservation.status}`
          );
          return { success: false, reason: 'Invalid reservation status' };
        }

        // Update to YOUR_TURN (atomic)
        await tx.reservation.update({
          where: { id: firstReservation.id },
          data: {
            status: 'YOUR_TURN',
            notifiedAt: new Date(),
            depositDeadline,
          },
        });

        // Send notification (outside transaction for reliability)
        if (firstReservation.ctv) {
          // Fire and forget - don't block transaction
          this.notificationsService.notifyReservationYourTurn(firstReservation.ctv.id, {
            reservationId: firstReservation.id,
            unitCode: unit.code,
          }).catch((err) => {
            console.error(`[Queue Processing] Failed to send notification for reservation ${firstReservation.id}:`, err);
          });
        }

        // Return success status
        return { 
          success: true, 
          reservationId: firstReservation.id,
          unitCode: unit.code,
        };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000, // 10s per unit
      }
    );
  }

  /**
   * Delete project (with constraints)
   */
  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        units: {
          where: {
            status: { notIn: ['AVAILABLE'] },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Get all unit IDs for this project
    const unitIds = await this.prisma.unit.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const unitIdList = unitIds.map((u) => u.id);

    // Check constraints before deletion
    const constraints: string[] = [];

    // 1. Check units that are not AVAILABLE
    if (project.units.length > 0) {
      const unitStatusCounts = project.units.reduce((acc, unit) => {
        acc[unit.status] = (acc[unit.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusSummary = Object.entries(unitStatusCounts)
        .map(([status, count]) => `${status}: ${count}`)
        .join(', ');

      constraints.push(
        `Có ${project.units.length} căn không AVAILABLE (${statusSummary})`
      );
    }

    // 2. Check active reservations
    if (unitIdList.length > 0) {
      const activeReservations = await this.prisma.reservation.count({
        where: {
          unitId: { in: unitIdList },
          status: { in: ['ACTIVE', 'YOUR_TURN'] },
          deletedAt: null,
        },
      });

      if (activeReservations > 0) {
        constraints.push(
          `Có ${activeReservations} đặt chỗ đang hoạt động (ACTIVE/YOUR_TURN)`
        );
      }
    }

    // 3. Check pending/approved bookings
    if (unitIdList.length > 0) {
      const activeBookings = await this.prisma.booking.count({
        where: {
          unitId: { in: unitIdList },
          status: { in: ['PENDING_APPROVAL', 'CONFIRMED', 'EXPIRED'] },
          deletedAt: null,
        },
      });

      if (activeBookings > 0) {
        constraints.push(
          `Có ${activeBookings} booking đang chờ duyệt/đã xác nhận/chưa hết hạn`
        );
      }
    }

    // 4. Check pending/approved deposits
    if (unitIdList.length > 0) {
      const activeDeposits = await this.prisma.deposit.count({
        where: {
          unitId: { in: unitIdList },
          status: { in: ['PENDING_APPROVAL', 'CONFIRMED'] },
          deletedAt: null,
        },
      });

      if (activeDeposits > 0) {
        constraints.push(
          `Có ${activeDeposits} đặt cọc đang chờ duyệt/đã xác nhận`
        );
      }
    }

    // If there are constraints, throw error with detailed message
    if (constraints.length > 0) {
      throw new BadRequestException(
        `Không thể xóa dự án vì:\n${constraints.map((c) => `- ${c}`).join('\n')}\n\n` +
        `Vui lòng xử lý các ràng buộc trên trước khi xóa dự án.`
      );
    }

    // Soft delete project in transaction with audit log
    const deleted = await this.prisma.$transaction(async (tx) => {
      const softDeleted = await tx.project.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'DELETE',
          entityType: 'PROJECT',
          entityId: id,
          oldValue: JSON.stringify({
            name: project.name,
            code: project.code,
            status: project.status,
            developer: project.developer,
            city: project.city,
            location: project.location,
          }),
        },
      });

      return softDeleted;
    });

    return { message: 'Xóa dự án thành công', project: deleted };
  }

  /**
   * Retry failed units from queue processing
   * Admin can call this to retry units that failed during initial processing
   */
  async retryFailedUnits(projectId: string, logId?: string) {
    // Get the most recent failed/partial log if logId not provided
    let log;
    if (logId) {
      log = await (this.prisma as any).queueProcessingLog.findUnique({
        where: { id: logId },
      });
    } else {
      log = await (this.prisma as any).queueProcessingLog.findFirst({
        where: {
          projectId,
          status: { in: ['FAILED', 'PARTIAL'] },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!log || !log.failedUnits) {
      throw new NotFoundException('Không tìm thấy log xử lý queue có lỗi để retry');
    }

    // Parse failed units
    const failedUnits: Array<{ unitId: string; error: string }> = JSON.parse(log.failedUnits);

    if (failedUnits.length === 0) {
      throw new BadRequestException('Không có unit nào cần retry');
    }

    console.log(`[Queue Processing] Retrying ${failedUnits.length} failed units for project ${projectId}`);

    // Create new log for retry
    const retryLog = await (this.prisma as any).queueProcessingLog.create({
      data: {
        projectId,
        status: 'PROCESSING',
        totalUnits: failedUnits.length,
        retryCount: log.retryCount + 1,
      },
    });

    const results = {
      total: failedUnits.length,
      processed: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ unitId: string; error: string }>,
    };

    try {
      // Process failed units
      for (const { unitId } of failedUnits) {
        try {
          const result = await this.processUnitQueue(unitId);
          if (result && typeof result === 'object' && 'skipped' in result && result.skipped) {
            results.skipped++;
          } else {
            results.processed++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            unitId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Update retry log
      const status = results.failed === 0 ? 'COMPLETED' : results.processed === 0 ? 'FAILED' : 'PARTIAL';

      await (this.prisma as any).queueProcessingLog.update({
        where: { id: retryLog.id },
        data: {
          status,
          processed: results.processed,
          skipped: results.skipped,
          failed: results.failed,
          failedUnits: results.errors.length > 0 ? JSON.stringify(results.errors) : null,
          completedAt: new Date(),
        },
      });

      // Send notification if still has errors
      if (results.errors.length > 0) {
        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { name: true },
        });
        await this.notificationsService.notifyAdminQueueProcessingErrors(
          projectId,
          project?.name || projectId,
          results.errors,
        );
      }

      return {
        message: `Retry hoàn thành: ${results.processed} thành công, ${results.failed} lỗi, ${results.skipped} bỏ qua`,
        results,
      };
    } catch (error) {
      await (this.prisma as any).queueProcessingLog.update({
        where: { id: retryLog.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  /**
   * Get queue processing logs for a project
   */
  async getQueueProcessingLogs(projectId: string) {
    return (this.prisma as any).queueProcessingLog.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 logs
    });
  }

  /**
   * Get project statistics
   */
  async getStatistics(id: string): Promise<ProjectStatistics> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Count units by status
    const unitStats = await this.prisma.unit.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: true,
    });

    const stats = {
      total: 0,
      available: 0,
      reserved_booking: 0,
      deposited: 0,
      sold: 0,
    };

    unitStats.forEach((stat) => {
      stats.total += stat._count;
      stats[stat.status.toLowerCase()] = stat._count;
    });

    // Count reservations in queue
    const activeReservations = await this.prisma.reservation.count({
      where: {
        unit: { projectId: id },
        status: { in: ['ACTIVE', 'YOUR_TURN'] },
      },
    });

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
      },
      units: stats,
      reservations: {
        inQueue: activeReservations,
      },
    };
  }
}

