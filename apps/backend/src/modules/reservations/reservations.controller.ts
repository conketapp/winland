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
   * Get all reservations (Admin) with pagination
   * GET /api/reservations?page=1&pageSize=20&status=...
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
    const filters = {
      status: query.status,
      projectId: query.projectId,
    };
    const pagination = {
      page: query.page ? parseInt(query.page) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize) : undefined,
    };
    return this.reservationsService.findAll(filters, pagination);
  }

  /**
   * Get reservation by ID
   * GET /api/reservations/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
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

