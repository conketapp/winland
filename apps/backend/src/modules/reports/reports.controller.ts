import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionStatus, CommissionStatus } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Sales Report
   * GET /api/reports/sales
   */
  @Get('sales')
  getSalesReport(@Query() query: SalesReportQueryDto) {
    return this.reportsService.getSalesReport(query);
  }

  /**
   * Commission Report
   * GET /api/reports/commissions
   */
  @Get('commissions')
  getCommissionReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('ctvId') ctvId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: CommissionStatus,
    @Query('groupBy') groupBy?: 'CTV' | 'PROJECT',
  ) {
    return this.reportsService.getCommissionReport({ from, to, ctvId, projectId, status, groupBy });
  }

  /**
   * Transaction Report
   * GET /api/reports/transactions
   */
  @Get('transactions')
  getTransactionReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: TransactionStatus,
  ) {
    return this.reportsService.getTransactionReport({ from, to, status });
  }

  /**
   * Inventory Report
   * GET /api/reports/inventory
   */
  @Get('inventory')
  getInventoryReport(@Query('projectId') projectId?: string) {
    return this.reportsService.getInventoryReport({ projectId });
  }
}

