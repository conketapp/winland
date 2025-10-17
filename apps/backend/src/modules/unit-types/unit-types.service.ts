import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';

@Injectable()
export class UnitTypesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new unit type
   */
  async create(createUnitTypeDto: CreateUnitTypeDto) {
    // Check if name or code already exists
    const existing = await this.prisma.unitType.findFirst({
      where: {
        OR: [
          { name: createUnitTypeDto.name },
          { code: createUnitTypeDto.code },
        ],
      },
    });

    if (existing) {
      if (existing.name === createUnitTypeDto.name) {
        throw new ConflictException('Unit type name already exists');
      }
      if (existing.code === createUnitTypeDto.code) {
        throw new ConflictException('Unit type code already exists');
      }
    }

    return this.prisma.unitType.create({
      data: createUnitTypeDto,
    });
  }

  /**
   * Get all unit types
   */
  async findAll() {
    return this.prisma.unitType.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { units: true },
        },
      },
    });
  }

  /**
   * Get one unit type by ID
   */
  async findOne(id: string) {
    const unitType = await this.prisma.unitType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { units: true },
        },
      },
    });

    if (!unitType) {
      throw new NotFoundException(`Unit type with ID ${id} not found`);
    }

    return unitType;
  }

  /**
   * Update unit type
   */
  async update(id: string, updateUnitTypeDto: UpdateUnitTypeDto) {
    await this.findOne(id); // Check existence

    // Check if name or code conflicts with other records
    if (updateUnitTypeDto.name || updateUnitTypeDto.code) {
      const existing = await this.prisma.unitType.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateUnitTypeDto.name ? { name: updateUnitTypeDto.name } : {},
                updateUnitTypeDto.code ? { code: updateUnitTypeDto.code } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        if (existing.name === updateUnitTypeDto.name) {
          throw new ConflictException('Unit type name already exists');
        }
        if (existing.code === updateUnitTypeDto.code) {
          throw new ConflictException('Unit type code already exists');
        }
      }
    }

    return this.prisma.unitType.update({
      where: { id },
      data: updateUnitTypeDto,
    });
  }

  /**
   * Delete unit type
   * Only allow delete if no units are using it
   */
  async remove(id: string) {
    const unitType = await this.findOne(id);

    // Check if any units are using this type
    const unitsCount = await this.prisma.unit.count({
      where: { unitTypeId: id },
    });

    if (unitsCount > 0) {
      throw new BadRequestException(
        `Cannot delete unit type. ${unitsCount} unit(s) are still using this type.`,
      );
    }

    await this.prisma.unitType.delete({
      where: { id },
    });

    return { message: 'Unit type deleted successfully', unitType };
  }
}

