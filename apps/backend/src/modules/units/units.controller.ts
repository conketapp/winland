import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { BulkImportUnitsDto } from './dto/bulk-import-units.dto';
import { QueryUnitDto } from './dto/query-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  /**
   * Bulk import units (Admin only) - CRITICAL FEATURE
   * POST /api/units/bulk-import
   */
  @Post('bulk-import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  bulkImport(@Body() dto: BulkImportUnitsDto, @Request() req) {
    return this.unitsService.bulkImport(dto, req.user?.userId);
  }

  /**
   * Create single unit (Admin only)
   * POST /api/units
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  /**
   * Get all units with filters
   * GET /api/units
   * Public or authenticated users can view (CTV and Admin)
   */
  @Get()
  findAll(@Query() query: QueryUnitDto) {
    return this.unitsService.findAll(query);
  }

  /**
   * Get unit by ID
   * GET /api/units/:id
   * Public or authenticated users can view
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  /**
   * Update unit (Admin only)
   * PATCH /api/units/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateUnitDto>) {
    return this.unitsService.update(id, dto);
  }

  /**
   * Delete unit (Admin only)
   * DELETE /api/units/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}

