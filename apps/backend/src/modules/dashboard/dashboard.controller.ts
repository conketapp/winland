/**
 * Dashboard Controller
 * Stats endpoints for Admin and CTV dashboards
 */

import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get Admin dashboard stats
   * GET /api/dashboard/admin-stats
   */
  @Get('admin-stats')
  @UseGuards(JwtAuthGuard)
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  /**
   * Get CTV dashboard stats
   * GET /api/dashboard/ctv-stats
   */
  @Get('ctv-stats')
  @UseGuards(JwtAuthGuard)
  getCtvStats(@Req() req: any) {
    const ctvId = req.user?.userId;
    return this.dashboardService.getCtvStats(ctvId);
  }

  /**
   * Get Revenue Analytics
   * GET /api/dashboard/analytics/revenue
   */
  @Get('analytics/revenue')
  @UseGuards(JwtAuthGuard)
  getRevenueAnalytics(@Query() query: any) {
    const dto = new AnalyticsQueryDto();
    dto.period = query.period || 'month';
    dto.timeRange = query.timeRange || '30d';
    dto.startDate = query.startDate;
    dto.endDate = query.endDate;
    dto.projectId = query.projectId;
    return this.dashboardService.getRevenueAnalytics(dto);
  }

  /**
   * Get CTV Performance Analytics
   * GET /api/dashboard/analytics/ctv-performance
   */
  @Get('analytics/ctv-performance')
  @UseGuards(JwtAuthGuard)
  getCtvPerformanceAnalytics(@Query() query: any) {
    const dto = new AnalyticsQueryDto();
    dto.timeRange = query.timeRange || '30d';
    dto.startDate = query.startDate;
    dto.endDate = query.endDate;
    dto.ctvId = query.ctvId;
    return this.dashboardService.getCtvPerformanceAnalytics(dto);
  }

  /**
   * Get Project Performance Analytics
   * GET /api/dashboard/analytics/project-performance
   */
  @Get('analytics/project-performance')
  @UseGuards(JwtAuthGuard)
  getProjectPerformanceAnalytics(@Query() query: any) {
    const dto = new AnalyticsQueryDto();
    dto.timeRange = query.timeRange || '30d';
    dto.startDate = query.startDate;
    dto.endDate = query.endDate;
    dto.projectId = query.projectId;
    return this.dashboardService.getProjectPerformanceAnalytics(dto);
  }
}





