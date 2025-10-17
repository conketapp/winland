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

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const where: any = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    return this.usersService.findAll(where);
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
}





