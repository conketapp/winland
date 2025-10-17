import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { BulkImportUnitsDto } from './dto/bulk-import-units.dto';
import { QueryUnitDto } from './dto/query-unit.dto';

@Injectable()
export class UnitsService {
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
   */
  async bulkImport(dto: BulkImportUnitsDto) {
    const { projectId, units } = dto;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      created: [] as any[],
    };

    // Process each unit
    for (let i = 0; i < units.length; i++) {
      const row = units[i];
      
      try {
        // 1. Find or create Building
        let building = await this.prisma.building.findFirst({
          where: {
            projectId,
            code: row.building,
          },
        });

        if (!building) {
          building = await this.prisma.building.create({
            data: {
              projectId,
              code: row.building,
              name: `Tòa ${row.building}`,
              floors: 30, // Default, can be updated later
            },
          });
        }

        // 2. Find or create Floor
        let floor = await this.prisma.floor.findFirst({
          where: {
            buildingId: building.id,
            number: row.floor,
          },
        });

        if (!floor) {
          floor = await this.prisma.floor.create({
            data: {
              buildingId: building.id,
              number: row.floor,
            },
          });
        }

        // 3. Find or create UnitType (if provided)
        let unitTypeId: string | null = null;
        if (row.type) {
          let unitType = await this.prisma.unitType.findUnique({
            where: { name: row.type },
          });

          if (!unitType) {
            unitType = await this.prisma.unitType.create({
              data: {
                name: row.type,
                code: row.type.toUpperCase().replace(/\s+/g, '_'),
              },
            });
          }

          unitTypeId = unitType.id;
        }

        // 4. Generate unit code
        const code = this.generateUnitCode(row.building, row.floor, row.unit);

        // 5. Check if unit already exists
        const existingUnit = await this.prisma.unit.findUnique({
          where: { code },
        });

        if (existingUnit) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: `Căn ${code} đã tồn tại`,
            data: row,
          });
          continue;
        }

        // 6. Create unit
        const unit = await this.prisma.unit.create({
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
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            direction: row.direction,
            view: row.view,
            commissionRate: row.commissionRate,
          },
        });

        results.success++;
        results.created.push({
          row: i + 1,
          code: unit.code,
          id: unit.id,
        });

      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error?.message || 'Unknown error',
          data: row,
        });
      }
    }

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
   * Find all units with filters
   */
  async findAll(query: QueryUnitDto) {
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

    const where: any = {};

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

    const units = await this.prisma.unit.findMany({
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
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return units.map(unit => ({
      ...unit,
      images: unit.images ? JSON.parse(unit.images) : [],
    }));
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
      },
    });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    return {
      ...unit,
      images: unit.images ? JSON.parse(unit.images) : [],
      reservationQueue: unit.reservations.length,
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
}

