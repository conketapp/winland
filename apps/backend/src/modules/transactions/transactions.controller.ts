import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * CTV creates a new transaction (payment record)
   * POST /api/transactions
   */
  @Post()
  @Roles('CTV')
  @UseGuards(RolesGuard)
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(createTransactionDto, req.user.userId);
  }

  /**
   * Get all transactions (Admin/CTV)
   * GET /api/transactions
   */
  @Get()
  findAll(@Query() query: QueryTransactionDto) {
    return this.transactionsService.findAll(query);
  }

  /**
   * Get payment summary for a deposit
   * GET /api/transactions/deposit/:depositId/summary
   */
  @Get('deposit/:depositId/summary')
  getPaymentSummary(@Param('depositId') depositId: string) {
    return this.transactionsService.getPaymentSummary(depositId);
  }

  /**
   * Get transactions by deposit
   * GET /api/transactions/deposit/:depositId
   */
  @Get('deposit/:depositId')
  findByDeposit(@Param('depositId') depositId: string) {
    return this.transactionsService.findByDeposit(depositId);
  }

  /**
   * Get transaction by ID
   * GET /api/transactions/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  /**
   * Admin confirms transaction
   * PATCH /api/transactions/:id/confirm
   */
  @Patch(':id/confirm')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  confirm(
    @Param('id') id: string,
    @Body() confirmDto: ConfirmTransactionDto,
    @Request() req,
  ) {
    return this.transactionsService.confirm(id, confirmDto, req.user.userId);
  }

  /**
   * Admin rejects transaction
   * PATCH /api/transactions/:id/reject
   */
  @Patch(':id/reject')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.transactionsService.reject(id, body.reason);
  }
}

