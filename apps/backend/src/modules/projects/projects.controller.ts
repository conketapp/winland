import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectStatus } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Create project (Admin only)
   * POST /api/projects
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(dto, req.user.userId);
  }

  /**
   * Get all projects
   * GET /api/projects
   * Must be before @Get(':id') to avoid route conflict
   */
  @Get()
  findAll(
    @Query('status') status?: ProjectStatus,
    @Query('city') city?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new DefaultValuePipe(20), new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    // Validate page and pageSize manually
    const validatedPage = page && page > 0 ? page : 1;
    const validatedPageSize = pageSize && pageSize > 0 && pageSize <= 100 ? pageSize : 20;
    
    return this.projectsService.findAll({
      status,
      city,
      search,
      sortBy,
      sortOrder,
      page: validatedPage,
      pageSize: validatedPageSize,
    });
  }

  /**
   * Get project by ID
   * GET /api/projects/:id
   * Must be after @Get() to avoid route conflict
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /**
   * Update project (Admin only)
   * PATCH /api/projects/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(id, dto, req.user.userId);
  }

  /**
   * Change project status
   * PATCH /api/projects/:id/status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  changeStatus(
    @Param('id') id: string,
    @Body() body: { status: ProjectStatus },
  ) {
    return this.projectsService.changeStatus(id, body.status);
  }

  /**
   * Get project statistics
   * GET /api/projects/:id/statistics
   */
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.projectsService.getStatistics(id);
  }

  /**
   * Delete project (Admin only)
   * DELETE /api/projects/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.userId);
  }

  /**
   * Get queue processing logs for a project
   * GET /api/projects/:id/queue-processing-logs
   */
  @Get(':id/queue-processing-logs')
  @UseGuards(JwtAuthGuard)
  getQueueProcessingLogs(@Param('id') id: string) {
    return this.projectsService.getQueueProcessingLogs(id);
  }

  /**
   * Retry failed units from queue processing
   * POST /api/projects/:id/retry-failed-units
   */
  @Post(':id/retry-failed-units')
  @UseGuards(JwtAuthGuard)
  retryFailedUnits(
    @Param('id') id: string,
    @Body() body?: { logId?: string },
  ) {
    return this.projectsService.retryFailedUnits(id, body?.logId);
  }
}

