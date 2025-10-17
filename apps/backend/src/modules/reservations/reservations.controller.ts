import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Create reservation (CTV only)
   * POST /api/reservations
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateReservationDto, @Request() req) {
    return this.reservationsService.create(dto, req.user.userId);
  }

  /**
   * Get my reservations (CTV)
   * GET /api/reservations/my-reservations
   */
  @Get('my-reservations')
  @UseGuards(JwtAuthGuard)
  getMyReservations(@Request() req) {
    return this.reservationsService.getMyReservations(req.user.userId);
  }

  /**
   * Get all reservations (Admin)
   * GET /api/reservations
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: { status?: string; projectId?: string }) {
    return this.reservationsService.findAll(query);
  }

  /**
   * Cancel reservation
   * DELETE /api/reservations/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  cancel(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason?: string },
  ) {
    return this.reservationsService.cancel(id, req.user.userId, body.reason);
  }
}

