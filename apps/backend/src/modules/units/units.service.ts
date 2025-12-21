import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { BulkImportUnitsDto } from './dto/bulk-import-units.dto';
import { QueryUnitDto } from './dto/query-unit.dto';
import { PaginationUtil, PaginationOptions, PaginationResult } from '../../common/utils/pagination.util';

@Injectable()
export class UnitsService {
  // Rate limiting config for bulk import
  private readonly BULK_IMPORT_COOLDOWN_MINUTES = 60;
  private readonly MAX_UNITS_PER_IMPORT = 1000;

  constructor(private prisma: PrismaService) {}

  /**
   * Generate unit code: {BuildingCode}-{FloorNumber}-{UnitNumber}
   * Example: A1-08-05
   */
  private generateUnitCode(buildingCode: string, floorNumber: number, unitNumber: string): string {
    const paddedFloor = floorNumber.toString().padStart(2, '0');
    const paddedUnit = unitNumber.padStart(2, '0');
    return `${buildingCode}-${paddedFloor}-${paddedUnit}`;
  }

  /**
   * Bulk import units from Excel (Admin feature)
   * This is a CRITICAL feature for initial project setup
   * 
   * Improvements:
   * - Batch processing for better performance
   * - Transaction with rollback on error
   * - Detailed validation before processing
   * - Dynamic floor calculation from data
   */
  async bulkImport(dto: BulkImportUnitsDto, userId?: string) {
    const { projectId, units } = dto;

    // Rate limiting check (if userId is provided)
    if (userId) {
      const oneHourAgo = new Date(Date.now() - this.BULK_IMPORT_COOLDOWN_MINUTES * 60 * 1000);
      
      // Count recent bulk imports by checking audit logs or units created by this user
      // For simplicity, we'll use a simple time-based check
      // In production, you might want to track this in a separate table or audit log
      const recentImports = await this.prisma.unit.count({
        where: {
          projectId,
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      // Simple heuristic: if > 1000 units created in last hour for this project, likely bulk import
      // This is a basic check - for production, track imports in audit log or separate tracking table
      if (recentImports > this.MAX_UNITS_PER_IMPORT) {
        throw new BadRequestException(
          `Bạn đã import quá nhiều căn trong 1 giờ. Vui lòng đợi ${this.BULK_IMPORT_COOLDOWN_MINUTES} phút trước khi import tiếp.`
        );
      }
    }

    // Limit number of units per import
    if (units.length > this.MAX_UNITS_PER_IMPORT) {
      throw new BadRequestException(
        `Không thể import quá ${this.MAX_UNITS_PER_IMPORT} căn một lần. Vui lòng chia nhỏ dữ liệu.`
      );
    }

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Step 1: Validate all data upfront (fail fast)
    const validationErrors: Array<{ row: number; error: string; data: any }> = [];
    units.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.building || !row.building.trim()) {
        validationErrors.push({ row: rowNum, error: 'Mã tòa không được để trống', data: row });
      }
      if (!row.unit || !row.unit.trim()) {
        validationErrors.push({ row: rowNum, error: 'Mã căn không được để trống', data: row });
      }
      if (typeof row.floor !== 'number' || row.floor < 1) {
        validationErrors.push({ row: rowNum, error: 'Số tầng phải là số >= 1', data: row });
      }
      if (!row.area || row.area <= 0) {
        validationErrors.push({ row: rowNum, error: 'Diện tích phải lớn hơn 0', data: row });
      }
      if (!row.price || row.price <= 0) {
        validationErrors.push({ row: rowNum, error: 'Giá phải lớn hơn 0', data: row });
      }
      if (row.bedrooms !== undefined && row.bedrooms < 0) {
        validationErrors.push({ row: rowNum, error: 'Số phòng ngủ phải >= 0', data: row });
      }
      if (row.bathrooms !== undefined && row.bathrooms < 0) {
        validationErrors.push({ row: rowNum, error: 'Số phòng WC phải >= 0', data: row });
      }
      if (row.commissionRate !== undefined && (row.commissionRate < 0 || row.commissionRate > 100)) {
        validationErrors.push({ row: rowNum, error: 'Tỷ lệ hoa hồng phải từ 0-100%', data: row });
      }
    });

    // If validation errors, return early (fail fast)
    if (validationErrors.length > 0) {
      return {
        message: `Import thất bại: ${validationErrors.length} lỗi validation`,
        summary: {
          total: units.length,
          success: 0,
          failed: validationErrors.length,
        },
        details: {
          created: [],
          errors: validationErrors,
        },
      };
    }

    // Step 2: Calculate max floor per building from data
    const buildingMaxFloors = new Map<string, number>();
    units.forEach(row => {
      const currentMax = buildingMaxFloors.get(row.building) || 0;
      if (row.floor > currentMax) {
        buildingMaxFloors.set(row.building, row.floor);
      }
    });

    // Step 3: Process in transaction for atomicity
    return await this.prisma.$transaction(async (tx) => {
      const results = {
        success: 0,
        failed: 0,
        errors: [] as any[],
        created: [] as any[],
      };

      // Cache for buildings, floors, unit types to avoid duplicate queries
      const buildingCache = new Map<string, any>();
      const floorCache = new Map<string, any>(); // key: `${buildingId}-${floorNumber}`
      const unitTypeCache = new Map<string, any>();

      // Pre-fetch existing buildings
      const existingBuildings = await tx.building.findMany({
        where: { projectId },
      });
      existingBuildings.forEach(b => buildingCache.set(b.code, b));

      // Pre-fetch existing floors for existing buildings
      const existingFloors = await tx.floor.findMany({
        where: {
          buildingId: { in: existingBuildings.map(b => b.id) },
        },
      });
      existingFloors.forEach(f => {
        floorCache.set(`${f.buildingId}-${f.number}`, f);
      });

      // Pre-fetch existing unit types
      const existingUnitTypes = await tx.unitType.findMany();
      existingUnitTypes.forEach(ut => unitTypeCache.set(ut.name, ut));

      // Pre-check existing units
      const unitCodes = units.map(row => 
        this.generateUnitCode(row.building, row.floor, row.unit)
      );
      const existingUnits = await tx.unit.findMany({
        where: { code: { in: unitCodes } },
        select: { code: true },
      });
      const existingUnitCodesSet = new Set(existingUnits.map(u => u.code));

      // Process all units
      for (let i = 0; i < units.length; i++) {
        const row = units[i];
        const rowNum = i + 1;
        
        try {
          const code = this.generateUnitCode(row.building, row.floor, row.unit);
          
          // Skip if already exists
          if (existingUnitCodesSet.has(code)) {
            results.failed++;
            results.errors.push({
              row: rowNum,
              error: `Căn ${code} đã tồn tại`,
              data: row,
            });
            continue;
          }

          // 1. Get or create Building
          let building = buildingCache.get(row.building);
          if (!building) {
            building = await tx.building.create({
              data: {
                projectId,
                code: row.building,
                name: `Tòa ${row.building}`,
                floors: buildingMaxFloors.get(row.building) || 30, // Use calculated max floor
              },
            });
            buildingCache.set(row.building, building);
          } else if (buildingMaxFloors.get(row.building) && buildingMaxFloors.get(row.building) > building.floors) {
            // Update building floors if calculated max is higher
            building = await tx.building.update({
              where: { id: building.id },
              data: { floors: buildingMaxFloors.get(row.building)! },
            });
            buildingCache.set(row.building, building);
          }

          // 2. Get or create Floor
          const floorKey = `${building.id}-${row.floor}`;
          let floor = floorCache.get(floorKey);
          if (!floor) {
            floor = await tx.floor.create({
              data: {
                buildingId: building.id,
                number: row.floor,
              },
            });
            floorCache.set(floorKey, floor);
          }

          // 3. Get or create UnitType
          let unitTypeId: string | null = null;
          if (row.type) {
            let unitType = unitTypeCache.get(row.type);
            if (!unitType) {
              unitType = await tx.unitType.create({
                data: {
                  name: row.type,
                  code: row.type.toUpperCase().replace(/\s+/g, '_'),
                },
              });
              unitTypeCache.set(row.type, unitType);
            }
            unitTypeId = unitType.id;
          }

          // 4. Create unit
          const unit = await tx.unit.create({
            data: {
              projectId,
              buildingId: building.id,
              floorId: floor.id,
              code,
              unitNumber: row.unit,
              unitTypeId,
              status: 'AVAILABLE',
              price: row.price,
              area: row.area,
              bedrooms: row.bedrooms ?? null,
              bathrooms: row.bathrooms ?? null,
              direction: row.direction ?? null,
              view: row.view ?? null,
              commissionRate: row.commissionRate ?? null,
            },
          });

          results.success++;
          results.created.push({
            row: rowNum,
            code: unit.code,
            id: unit.id,
          });

        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: rowNum,
            error: error?.message || 'Unknown error',
            data: row,
          });
        }
      }

      // If all failed, throw to trigger rollback (optional - you might want partial success)
      // Uncomment if you want all-or-nothing behavior:
      // if (results.success === 0 && results.failed > 0) {
      //   throw new BadRequestException('Không có căn nào được import thành công');
      // }

      return {
        message: `Import thành công ${results.success}/${units.length} căn`,
        summary: {
          total: units.length,
          success: results.success,
          failed: results.failed,
        },
        details: {
          created: results.created,
          errors: results.errors,
        },
      };
    }, {
      timeout: 60000, // 60 seconds timeout for large imports
    });
  }

  /**
   * Create single unit
   */
  async create(dto: CreateUnitDto) {
    // Verify dependencies exist
    const [project, building, floor] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: dto.projectId } }),
      this.prisma.building.findUnique({ where: { id: dto.buildingId } }),
      this.prisma.floor.findUnique({ where: { id: dto.floorId } }),
    ]);

    if (!project) throw new NotFoundException('Dự án không tồn tại');
    if (!building) throw new NotFoundException('Tòa nhà không tồn tại');
    if (!floor) throw new NotFoundException('Tầng không tồn tại');

    // Generate code
    const code = this.generateUnitCode(building.code, floor.number, dto.unitNumber);

    // Check duplicate
    const existing = await this.prisma.unit.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException(`Căn ${code} đã tồn tại`);
    }

    return await this.prisma.unit.create({
      data: {
        ...dto,
        code,
        images: dto.images ? JSON.stringify(dto.images) : null,
      },
      include: {
        project: true,
        building: true,
        floor: true,
        unitType: true,
      },
    });
  }

  /**
   * Find all units with filters and pagination
   */
  async findAll(query: QueryUnitDto): Promise<PaginationResult<any>> {
    const {
      projectId,
      buildingId,
      floorId,
      status,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      bedrooms,
      unitTypeId,
      search,
      sortBy = 'code',
      sortOrder = 'asc',
    } = query;

    const where: any = {
      deletedAt: null, // Exclude soft-deleted units
    };

    if (projectId) where.projectId = projectId;
    if (buildingId) where.buildingId = buildingId;
    if (floorId) where.floorId = floorId;
    if (status) where.status = status;
    if (unitTypeId) where.unitTypeId = unitTypeId;
    if (bedrooms) where.bedrooms = bedrooms;

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    if (areaMin !== undefined || areaMax !== undefined) {
      where.area = {};
      if (areaMin !== undefined) where.area.gte = areaMin;
      if (areaMax !== undefined) where.area.lte = areaMax;
    }

    if (search) {
      where.code = { contains: search, mode: 'insensitive' };
    }

    // Filter by reservation status
    if (query.hasReservation && query.hasReservation !== 'all') {
      if (query.hasReservation === 'has') {
        // Has active reservations
        where.reservations = {
          some: {
            status: { in: ['ACTIVE', 'YOUR_TURN'] },
            deletedAt: null,
          },
        };
      } else if (query.hasReservation === 'empty') {
        // No active reservations
        where.NOT = {
          reservations: {
            some: {
              status: { in: ['ACTIVE', 'YOUR_TURN'] },
              deletedAt: null,
            },
          },
        };
      }
    }

    // Normalize pagination options
    const paginationOptions: PaginationOptions = {
      page: query.page,
      pageSize: query.pageSize,
      maxPageSize: 100, // Max 100 units per page
    };
    const { page, pageSize, skip, take } = PaginationUtil.normalize(paginationOptions);

    // Get items and total count in parallel (optimized)
    const [units, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
            },
          },
          building: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          floor: {
            select: {
              id: true,
              number: true,
            },
          },
          unitType: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              reservations: true,
              bookings: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
      }),
      this.prisma.unit.count({ where }),
    ]);

    // Get detailed status info for RESERVED_BOOKING units (batch query for performance)
    const reservedBookingUnitIds = units
      .filter(u => u.status === 'RESERVED_BOOKING')
      .map(u => u.id);

    const statusDetailsMap = new Map<string, { hasReservation: boolean; hasBooking: boolean }>();
    if (reservedBookingUnitIds.length > 0) {
      const [activeReservations, activeBookings] = await Promise.all([
        this.prisma.reservation.findMany({
          where: {
            unitId: { in: reservedBookingUnitIds },
            status: { in: ['ACTIVE', 'YOUR_TURN'] },
            deletedAt: null,
          },
          select: { unitId: true },
          distinct: ['unitId'],
        }),
        this.prisma.booking.findMany({
          where: {
            unitId: { in: reservedBookingUnitIds },
            status: { in: ['PENDING_PAYMENT', 'PENDING_APPROVAL', 'CONFIRMED'] },
            deletedAt: null,
          },
          select: { unitId: true },
          distinct: ['unitId'],
        }),
      ]);

      reservedBookingUnitIds.forEach(unitId => {
        statusDetailsMap.set(unitId, {
          hasReservation: activeReservations.some(r => r.unitId === unitId),
          hasBooking: activeBookings.some(b => b.unitId === unitId),
        });
      });
    }

    const mappedUnits = units.map(unit => {
      const baseUnit = {
        ...unit,
        images: unit.images ? JSON.parse(unit.images) : [],
      };

      // Add detailed status info for RESERVED_BOOKING
      if (unit.status === 'RESERVED_BOOKING') {
        const statusDetails = statusDetailsMap.get(unit.id) || { hasReservation: false, hasBooking: false };
        return {
          ...baseUnit,
          statusDetails: {
            hasActiveReservation: statusDetails.hasReservation,
            hasActiveBooking: statusDetails.hasBooking,
            // Computed: actual status breakdown
            actualStatus: statusDetails.hasBooking 
              ? 'BOOKED' 
              : statusDetails.hasReservation 
                ? 'RESERVED' 
                : 'RESERVED_BOOKING', // Fallback (shouldn't happen, but safety)
          },
        };
      }

      return baseUnit;
    });

    return PaginationUtil.createResult(mappedUnits, total, page, pageSize);
  }

  /**
   * Sync unit status based on active reservations and bookings
   * This ensures unit status accurately reflects actual state
   * 
   * Logic:
   * - If unit status is SOLD → Never change (return early)
   * - If unit status is DEPOSITED → Never auto-change (return early)
   * - If unit has active booking (PENDING_PAYMENT, PENDING_APPROVAL, CONFIRMED) → RESERVED_BOOKING
   * - If unit has active reservation (ACTIVE, YOUR_TURN) → RESERVED_BOOKING
   * - Otherwise → AVAILABLE
   * 
   * This method is called automatically when:
   * - Reservation is cancelled/expired
   * - Booking is cancelled/expired
   * - Can also be called manually for cleanup/maintenance
   */
  async syncUnitStatus(unitId: string): Promise<void> {
    // Get unit with current status
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    // Never auto-change SOLD or DEPOSITED status
    if (unit.status === 'SOLD' || unit.status === 'DEPOSITED') {
      return;
    }

    // Check for active bookings (PENDING_PAYMENT, PENDING_APPROVAL, CONFIRMED)
    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        unitId,
        status: { in: ['PENDING_PAYMENT', 'PENDING_APPROVAL', 'CONFIRMED'] },
        deletedAt: null,
      },
    });

    // Check for active reservations (ACTIVE, YOUR_TURN)
    const activeReservation = await this.prisma.reservation.findFirst({
      where: {
        unitId,
        status: { in: ['ACTIVE', 'YOUR_TURN'] },
        deletedAt: null,
      },
    });

    // Determine target status
    let targetStatus = unit.status;
    if (activeBooking || activeReservation) {
      targetStatus = 'RESERVED_BOOKING';
    } else {
      targetStatus = 'AVAILABLE';
    }

    // Update if status changed
    if (targetStatus !== unit.status) {
      await this.prisma.unit.update({
        where: { id: unitId },
        data: { status: targetStatus },
      });
    }
  }

  /**
   * Find unit by ID
   */
  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        project: true,
        building: true,
        floor: true,
        unitType: true,
        reservations: {
          where: {
            status: { in: ['ACTIVE', 'YOUR_TURN'] },
            deletedAt: null,
          },
          orderBy: {
            priority: 'asc',
          },
          include: {
            ctv: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        bookings: {
          where: {
            status: { in: ['PENDING_PAYMENT', 'PENDING_APPROVAL', 'CONFIRMED'] },
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            ctv: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            reservations: true,
            bookings: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    // Determine detailed status for RESERVED_BOOKING
    let statusDetails = undefined;
    if (unit.status === 'RESERVED_BOOKING') {
      const hasActiveReservation = unit.reservations.length > 0;
      const hasActiveBooking = unit.bookings.length > 0;
      
      statusDetails = {
        hasActiveReservation,
        hasActiveBooking,
        actualStatus: hasActiveBooking 
          ? 'BOOKED' 
          : hasActiveReservation 
            ? 'RESERVED' 
            : 'RESERVED_BOOKING', // Fallback
      };
    }

    return {
      ...unit,
      images: unit.images ? JSON.parse(unit.images) : [],
      reservationQueue: unit.reservations.length,
      statusDetails,
    };
  }

  /**
   * Update unit
   */
  async update(id: string, dto: Partial<CreateUnitDto>) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    // Cannot change projectId, buildingId, floorId (would break code)
    if (dto.projectId || dto.buildingId || dto.floorId) {
      throw new BadRequestException('Không thể thay đổi dự án/tòa nhà/tầng của căn hộ');
    }

    return await this.prisma.unit.update({
      where: { id },
      data: {
        ...dto,
        images: dto.images ? JSON.stringify(dto.images) : undefined,
      },
    });
  }

  /**
   * Delete unit (with constraints)
   */
  async remove(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        reservations: true,
        bookings: true,
        deposits: true,
      },
    });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    // Cannot delete if has any active transactions
    if (unit.reservations.length > 0 || unit.bookings.length > 0 || unit.deposits.length > 0) {
      throw new BadRequestException('Không thể xóa căn có giao dịch liên quan');
    }

    await this.prisma.unit.delete({ where: { id } });

    return { message: 'Xóa căn thành công' };
  }

  /**
   * Batch sync unit statuses for all units with RESERVED_BOOKING status
   * Useful for maintenance/cleanup operations
   * 
   * This will check all RESERVED_BOOKING units and sync their status
   * based on actual reservations/bookings state
   */
  async syncAllReservedBookingStatuses(): Promise<{ synced: number; changed: number; errors: string[] }> {
    const units = await this.prisma.unit.findMany({
      where: {
        status: 'RESERVED_BOOKING',
        deletedAt: null,
      },
      select: { id: true },
    });

    let changed = 0;
    const errors: string[] = [];

    for (const unit of units) {
      try {
        const beforeStatus = await this.prisma.unit.findUnique({
          where: { id: unit.id },
          select: { status: true },
        });

        await this.syncUnitStatus(unit.id);

        const afterStatus = await this.prisma.unit.findUnique({
          where: { id: unit.id },
          select: { status: true },
        });

        if (beforeStatus?.status !== afterStatus?.status) {
          changed++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Unit ${unit.id}: ${errorMessage}`);
      }
    }

    return {
      synced: units.length,
      changed,
      errors,
    };
  }
}

