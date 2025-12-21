import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  /**
   * Create deposit (CTV)
   * POST /api/deposits
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateDepositDto, @Request() req) {
    return this.depositsService.create(dto, req.user.userId);
  }

  /**
   * Approve deposit (Admin)
   * PATCH /api/deposits/:id/approve
   */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Param('id') id: string, @Request() req) {
    return this.depositsService.approve(id, req.user.userId);
  }

  /**
   * Get all deposits (Admin) with pagination
   * GET /api/deposits?page=1&pageSize=20&status=...
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() query: { 
      status?: string; 
      projectId?: string;
      page?: string;
      pageSize?: string;
    }
  ) {
    try {
      const filters = {
        status: query.status,
        projectId: query.projectId,
      };
      const pagination = {
        page: query.page ? parseInt(query.page) : undefined,
        pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      };
      return this.depositsService.findAll(filters, pagination);
    } catch (error: any) {
      console.error('DepositsController.findAll error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Get my deposits (CTV)
   * GET /api/deposits/my-deposits
   */
  @Get('my-deposits')
  @UseGuards(JwtAuthGuard)
  getMyDeposits(@Request() req) {
    return this.depositsService.getMyDeposits(req.user.userId);
  }

  /**
   * Get trash deposits (Admin)
   * GET /api/deposits/trash
   */
  @Get('trash')
  @UseGuards(JwtAuthGuard)
  getTrash() {
    return this.depositsService.findTrash();
  }

  /**
   * Cleanup deposit: release unit back to AVAILABLE (Admin)
   * PATCH /api/deposits/:id/cleanup
   */
  @Patch(':id/cleanup')
  @UseGuards(JwtAuthGuard)
  cleanup(@Param('id') id: string, @Request() req) {
    return this.depositsService.cleanup(id, req.user.userId);
  }

  /**
   * Update final price for a deposit (Admin)
   * This will trigger commission recalculation if commission exists and is PENDING
   * PATCH /api/deposits/:id/final-price
   */
  @Patch(':id/final-price')
  @UseGuards(JwtAuthGuard)
  updateFinalPrice(
    @Param('id') id: string,
    @Body() body: { finalPrice: number },
    @Request() req,
  ) {
    return this.depositsService.updateFinalPrice(id, body.finalPrice, req.user.userId);
  }
}

