import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

@Injectable()
export class SystemConfigService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new system config
   */
  async create(createSystemConfigDto: CreateSystemConfigDto) {
    // Check if key already exists
    const existing = await this.prisma.systemConfig.findUnique({
      where: { key: createSystemConfigDto.key },
    });

    if (existing) {
      throw new ConflictException(`Config key '${createSystemConfigDto.key}' already exists`);
    }

    // Validate value based on type
    this.validateValue(createSystemConfigDto.value, createSystemConfigDto.type);

    return this.prisma.systemConfig.create({
      data: createSystemConfigDto,
    });
  }

  /**
   * Get all configs (optionally filter by category)
   */
  async findAll(category?: string) {
    return this.prisma.systemConfig.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  /**
   * Get config by ID
   */
  async findOne(id: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Config with ID ${id} not found`);
    }

    return config;
  }

  /**
   * Get config by key
   */
  async findByKey(key: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`Config key '${key}' not found`);
    }

    return config;
  }

  /**
   * Update config value
   */
  async update(id: string, updateSystemConfigDto: UpdateSystemConfigDto) {
    const config = await this.findOne(id);

    // Validate new value if provided
    if (updateSystemConfigDto.value) {
      this.validateValue(updateSystemConfigDto.value, config.type);
    }

    return this.prisma.systemConfig.update({
      where: { id },
      data: updateSystemConfigDto,
    });
  }

  /**
   * Update config by key
   */
  async updateByKey(key: string, value: string) {
    const config = await this.findByKey(key);

    // Validate value
    this.validateValue(value, config.type);

    return this.prisma.systemConfig.update({
      where: { key },
      data: { value },
    });
  }

  /**
   * Delete config
   */
  async remove(id: string) {
    await this.findOne(id); // Check existence

    await this.prisma.systemConfig.delete({
      where: { id },
    });

    return { message: 'System config deleted successfully' };
  }

  /**
   * Get config categories
   */
  async getCategories() {
    const configs = await this.prisma.systemConfig.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return configs.map((c) => c.category);
  }

  /**
   * Validate value based on type
   */
  private validateValue(value: string, type: string) {
    switch (type) {
      case 'number':
        if (isNaN(Number(value))) {
          throw new BadRequestException(`Value must be a valid number`);
        }
        break;

      case 'boolean':
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(`Value must be 'true' or 'false'`);
        }
        break;

      case 'json':
        try {
          JSON.parse(value);
        } catch (error) {
          throw new BadRequestException(`Value must be valid JSON`);
        }
        break;

      case 'string':
        // Any string is valid
        break;

      default:
        throw new BadRequestException(`Invalid type: ${type}`);
    }
  }

  /**
   * Get parsed value (convert string to actual type)
   */
  async getValueByKey(key: string): Promise<any> {
    const config = await this.findByKey(key);
    return this.parseValue(config.value, config.type);
  }

  /**
   * Parse value based on type
   */
  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  /**
   * Get multiple config values by keys
   */
  async getValuesByKeys(keys: string[]): Promise<Record<string, any>> {
    const configs = await this.prisma.systemConfig.findMany({
      where: { key: { in: keys } },
    });

    const result: Record<string, any> = {};
    configs.forEach((config) => {
      result[config.key] = this.parseValue(config.value, config.type);
    });

    return result;
  }
}

