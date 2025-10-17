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
   * Get all bookings (Admin)
   * GET /api/bookings
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: { status?: string; projectId?: string }) {
    return this.bookingsService.findAll(query);
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
}

