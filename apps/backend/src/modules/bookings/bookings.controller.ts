import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /**
   * Create booking (CTV)
   * POST /api/bookings
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(dto, req.user.userId);
  }

  /**
   * Approve booking (Admin) - CRITICAL
   * PATCH /api/bookings/:id/approve
   */
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Param('id') id: string, @Request() req) {
    return this.bookingsService.approve(id, req.user.userId);
  }

  /**
   * Reject booking (Admin)
   * PATCH /api/bookings/:id/reject
   */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  reject(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    return this.bookingsService.reject(id, req.user.userId, body.reason);
  }

  /**
   * Cancel booking (CTV or Admin)
   * DELETE /api/bookings/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason?: string },
  ) {
    return this.bookingsService.cancel(id, req.user.userId, body.reason);
  }

  /**
   * Get all bookings (Admin) with pagination
   * GET /api/bookings?page=1&pageSize=20&status=...
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: { 
      status?: string; 
      projectId?: string; 
      ctvId?: string;
      page?: string;
      pageSize?: string;
    }
  ) {
    try {
      const filters = {
        status: query.status,
        projectId: query.projectId,
        ctvId: query.ctvId,
      };
      const pagination = {
        page: query.page ? parseInt(query.page) : undefined,
        pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
      };
      return await this.bookingsService.findAll(filters, pagination);
    } catch (error: any) {
      console.error('BookingsController.findAll error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Get my bookings (CTV)
   * GET /api/bookings/my-bookings
   */
  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  getMyBookings(@Request() req) {
    return this.bookingsService.getMyBookings(req.user.userId);
  }

  /**
   * Get trash bookings (Admin)
   * GET /api/bookings/trash
   */
  @Get('trash')
  @UseGuards(JwtAuthGuard)
  getTrash() {
    return this.bookingsService.findTrash();
  }

  /**
   * Cleanup booking: release unit back to AVAILABLE (Admin)
   * PATCH /api/bookings/:id/cleanup
   */
  @Patch(':id/cleanup')
  @UseGuards(JwtAuthGuard)
  cleanup(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cleanup(id, req.user.userId);
  }

  /**
   * Update payment proof for a booking (Admin)
   * PATCH /api/bookings/:id/payment-proof
   */
  @Patch(':id/payment-proof')
  @UseGuards(JwtAuthGuard)
  updatePaymentProof(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { paymentProof: any },
  ) {
    return this.bookingsService.updatePaymentProof(id, req.user.userId, body.paymentProof);
  }

  /**
   * Check and process expired bookings (Admin or System)
   * POST /api/bookings/check-expired
   */
  @Post('check-expired')
  @UseGuards(JwtAuthGuard)
  async checkExpired() {
    try {
      return await this.bookingsService.processExpiredBookings();
    } catch (error: any) {
      throw error; // Let NestJS error filter handle it
    }
  }
}

