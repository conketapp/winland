import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

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

    return await this.prisma.project.create({
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
  }

  /**
   * Get all projects with filters
   */
  async findAll(query: QueryProjectDto) {
    const { status, city, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (city) {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await this.prisma.project.findMany({
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
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return projects;
  }

  /**
   * Get project by ID
   */
  async findOne(id: string) {
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
  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Check code uniqueness if changing
    if (dto.code && dto.code !== project.code) {
      const existing = await this.prisma.project.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw new ConflictException(`Mã dự án "${dto.code}" đã tồn tại`);
      }
    }

    return await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        amenities: dto.amenities ? JSON.stringify(dto.amenities) : undefined,
        images: dto.images ? JSON.stringify(dto.images) : undefined,
        openDate: dto.openDate ? new Date(dto.openDate) : undefined,
      },
    });
  }

  /**
   * Change project status (UPCOMING → OPEN → CLOSED)
   * CRITICAL: When OPEN, trigger reservation queue processing
   */
  async changeStatus(id: string, newStatus: ProjectStatus) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        units: {
          where: {
            status: { in: ['AVAILABLE'] },
          },
        },
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

    // Update project status
    const updated = await this.prisma.project.update({
      where: { id },
      data: { status: newStatus },
    });

    // 🔥 CRITICAL: If changing to OPEN, process reservation queues
    if (newStatus === ProjectStatus.OPEN && project.status === ProjectStatus.UPCOMING) {
      await this.processReservationQueues(id);
    }

    return updated;
  }

  /**
   * 🔥 CRITICAL BUSINESS LOGIC: Process reservation queues when project opens
   * This notifies the first CTV in queue for each unit
   */
  private async processReservationQueues(projectId: string) {
    // Get all AVAILABLE units in this project
    const units = await this.prisma.unit.findMany({
      where: {
        projectId,
        status: 'AVAILABLE',
      },
    });

    for (const unit of units) {
      // Find first active reservation (lowest priority)
      const firstReservation = await this.prisma.reservation.findFirst({
        where: {
          unitId: unit.id,
          status: 'ACTIVE',
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      if (firstReservation) {
        // Update to YOUR_TURN
        const depositDeadline = new Date();
        depositDeadline.setHours(depositDeadline.getHours() + 48); // 48h to deposit

        await this.prisma.reservation.update({
          where: { id: firstReservation.id },
          data: {
            status: 'YOUR_TURN',
            notifiedAt: new Date(),
            depositDeadline,
          },
        });

        // TODO: Send notification to CTV
        // await this.notificationService.sendYourTurnNotification(firstReservation.ctvId, unit);
      }
    }
  }

  /**
   * Delete project (with constraints)
   */
  async remove(id: string) {
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

    // Cannot delete if has units that are not AVAILABLE
    if (project.units.length > 0) {
      throw new BadRequestException(
        'Không thể xóa dự án có căn hộ đang được giữ chỗ/đặt cọc/đã bán'
      );
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Xóa dự án thành công' };
  }

  /**
   * Get project statistics
   */
  async getStatistics(id: string) {
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

