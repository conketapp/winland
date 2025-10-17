import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UnitTypesService } from './unit-types.service';
import { CreateUnitTypeDto } from './dto/create-unit-type.dto';
import { UpdateUnitTypeDto } from './dto/update-unit-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('unit-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitTypesController {
  constructor(private readonly unitTypesService: UnitTypesService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() createUnitTypeDto: CreateUnitTypeDto) {
    return this.unitTypesService.create(createUnitTypeDto);
  }

  @Get()
  findAll() {
    return this.unitTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateUnitTypeDto: UpdateUnitTypeDto) {
    return this.unitTypesService.update(id, updateUnitTypeDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.unitTypesService.remove(id);
  }
}

