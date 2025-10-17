import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PaymentRequestsService } from './payment-requests.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { ApprovePaymentRequestDto } from './dto/approve-payment-request.dto';
import { RejectPaymentRequestDto } from './dto/reject-payment-request.dto';
import { QueryPaymentRequestDto } from './dto/query-payment-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payment-requests')
@UseGuards(JwtAuthGuard)
export class PaymentRequestsController {
  constructor(private readonly paymentRequestsService: PaymentRequestsService) {}

  /**
   * CTV creates payment request
   * POST /api/payment-requests
   */
  @Post()
  @Roles('CTV')
  @UseGuards(RolesGuard)
  create(@Body() createDto: CreatePaymentRequestDto, @Request() req) {
    return this.paymentRequestsService.create(createDto, req.user.userId);
  }

  /**
   * Get all payment requests (Admin)
   * GET /api/payment-requests
   */
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  findAll(@Query() query: QueryPaymentRequestDto) {
    return this.paymentRequestsService.findAll(query);
  }

  /**
   * CTV gets their own payment requests
   * GET /api/payment-requests/my-requests
   */
  @Get('my-requests')
  @Roles('CTV')
  @UseGuards(RolesGuard)
  findMyRequests(@Request() req) {
    return this.paymentRequestsService.findMyRequests(req.user.userId);
  }

  /**
   * CTV gets their commission summary
   * GET /api/payment-requests/my-summary
   */
  @Get('my-summary')
  @Roles('CTV')
  @UseGuards(RolesGuard)
  getMySummary(@Request() req) {
    return this.paymentRequestsService.getMySummary(req.user.userId);
  }

  /**
   * Get payment request by ID
   * GET /api/payment-requests/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentRequestsService.findOne(id);
  }

  /**
   * Admin approves payment request
   * PATCH /api/payment-requests/:id/approve
   */
  @Patch(':id/approve')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  approve(
    @Param('id') id: string,
    @Body() approveDto: ApprovePaymentRequestDto,
    @Request() req,
  ) {
    return this.paymentRequestsService.approve(id, approveDto, req.user.userId);
  }

  /**
   * Admin rejects payment request
   * PATCH /api/payment-requests/:id/reject
   */
  @Patch(':id/reject')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectPaymentRequestDto,
    @Request() req,
  ) {
    return this.paymentRequestsService.reject(id, rejectDto, req.user.userId);
  }

}

