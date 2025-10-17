import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { BulkImportUnitsDto } from './dto/bulk-import-units.dto';
import { QueryUnitDto } from './dto/query-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  /**
   * Bulk import units (Admin only) - CRITICAL FEATURE
   * POST /api/units/bulk-import
   */
  @Post('bulk-import')
  @UseGuards(JwtAuthGuard)
  bulkImport(@Body() dto: BulkImportUnitsDto) {
    return this.unitsService.bulkImport(dto);
  }

  /**
   * Create single unit (Admin only)
   * POST /api/units
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  /**
   * Get all units with filters
   * GET /api/units
   */
  @Get()
  findAll(@Query() query: QueryUnitDto) {
    return this.unitsService.findAll(query);
  }

  /**
   * Get unit by ID
   * GET /api/units/:id
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
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: Partial<CreateUnitDto>) {
    return this.unitsService.update(id, dto);
  }

  /**
   * Delete unit (Admin only)
   * DELETE /api/units/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}

