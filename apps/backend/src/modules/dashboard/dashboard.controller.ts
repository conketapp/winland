/**
 * Dashboard Controller
 * Stats endpoints for Admin and CTV dashboards
 */

import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}





