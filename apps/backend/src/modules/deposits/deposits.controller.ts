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
   * Get all deposits (Admin)
   * GET /api/deposits
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: { status?: string; projectId?: string }) {
    return this.depositsService.findAll(query);
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
}

