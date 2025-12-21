import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { QueryCommissionDto } from './dto/query-commission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ErrorMessages } from '../../common/constants/error-messages';

@Controller('commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  /**
   * Get all commissions (Admin only)
   */
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAll(@Query() query: QueryCommissionDto) {
    const { page, limit, ...filters } = query;
    return this.commissionsService.findAll(
      filters,
      { page, limit },
    );
  }

  /**
   * Get my commissions (CTV)
   */
  @Get('my-commissions')
  @Roles('CTV')
  async findMyCommissions(
    @Request() req: any,
    @Query() query: QueryCommissionDto,
  ) {
    const ctvId = req.user.id;
    const { page, limit, status } = query;
    return this.commissionsService.findMyCommissions(
      ctvId,
      { status },
      { page, limit },
    );
  }

  /**
   * Get my commission summary (CTV)
   */
  @Get('my-summary')
  @Roles('CTV')
  async getMySummary(@Request() req: any) {
    const ctvId = req.user.id;
    return this.commissionsService.getMySummary(ctvId);
  }

  /**
   * Get commission by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const commission = await this.commissionsService.findOne(id);
    
    // CTV can only view their own commissions
    if (req.user.role === 'CTV' && commission.ctvId !== req.user.id) {
      throw new ForbiddenException(ErrorMessages.COMMON.FORBIDDEN);
    }
    
    return commission;
  }

  /**
   * Recalculate commission (Admin only)
   */
  @Patch(':id/recalculate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async recalculate(@Param('id') id: string) {
    const commission = await this.commissionsService.findOne(id);
    return this.commissionsService.recalculateCommission(commission.depositId);
  }
}
