import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';

class QueryUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAll(@Query() query: QueryUsersDto) {
    const { page, limit, status, role } = query;
    
    const filters: { role?: UserRole; isActive?: boolean } = {};
    
    if (role) {
      filters.role = role;
    }

    if (status && status !== 'all') {
      filters.isActive = status === 'active';
    }

    return this.usersService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined,
      page && limit ? { page, limit } : undefined,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/activate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async activate(@Param('id') id: string) {
    return this.usersService.updateStatus(id, true);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deactivate(@Param('id') id: string) {
    return this.usersService.updateStatus(id, false);
  }

  /**
   * Sync user totalDeals from actual deposits
   * PATCH /api/users/:id/sync-total-deals
   */
  @Patch(':id/sync-total-deals')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async syncTotalDeals(@Param('id') id: string) {
    return this.usersService.syncUserTotalDeals(id);
  }

  /**
   * Search users
   * GET /api/users/search?q=query&role=CTV&status=active
   */
  @Get('search')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async search(
    @Query('q') query: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    if (!query) {
      return [];
    }

    const filters: { role?: UserRole; isActive?: boolean } = {};
    
    if (role) {
      filters.role = role as UserRole;
    }

    if (status && status !== 'all') {
      filters.isActive = status === 'active';
    }

    return this.usersService.search(query, Object.keys(filters).length > 0 ? filters : undefined);
  }
}





