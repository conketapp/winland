import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
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
   */
  @Get()
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAll(query);
  }

  /**
   * Get project by ID
   * GET /api/projects/:id
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
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
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
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}

