import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Get audit logs with filters & pagination
   * GET /api/audit-logs
   */
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll(@Query() query: QueryAuditLogDto) {
    return this.auditLogService.findAll(query);
  }

  /**
   * Get distinct actions
   * GET /api/audit-logs/actions
   */
  @Get('actions')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getActions() {
    return this.auditLogService.getActions();
  }

  /**
   * Get distinct entity types
   * GET /api/audit-logs/entity-types
   */
  @Get('entity-types')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getEntityTypes() {
    return this.auditLogService.getEntityTypes();
  }
}


