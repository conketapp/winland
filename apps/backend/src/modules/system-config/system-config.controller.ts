import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() createSystemConfigDto: CreateSystemConfigDto) {
    return this.systemConfigService.create(createSystemConfigDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll(@Query('category') category?: string) {
    return this.systemConfigService.findAll(category);
  }

  @Get('categories')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getCategories() {
    return this.systemConfigService.getCategories();
  }

  @Get('key/:key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  findByKey(@Param('key') key: string) {
    return this.systemConfigService.findByKey(key);
  }

  @Get('value/:key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getValueByKey(@Param('key') key: string) {
    return this.systemConfigService.getValueByKey(key);
  }

  @Post('values')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getValuesByKeys(@Body() body: { keys: string[] }) {
    return this.systemConfigService.getValuesByKeys(body.keys);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.systemConfigService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateSystemConfigDto: UpdateSystemConfigDto) {
    return this.systemConfigService.update(id, updateSystemConfigDto);
  }

  @Patch('key/:key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateByKey(@Param('key') key: string, @Body() body: { value: string }) {
    return this.systemConfigService.updateByKey(key, body.value);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.systemConfigService.remove(id);
  }
}

