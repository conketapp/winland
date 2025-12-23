/**
 * PDF Templates Management Controller
 * API để quản lý PDF templates
 */

import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PdfTemplatesService } from './pdf-templates.service';
import { UpdateTemplateDto, PreviewTemplateDto } from './dto/template.dto';

@Controller('pdf-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // Chỉ Admin mới được quản lý templates
export class PdfTemplatesController {
  private readonly logger = new Logger(PdfTemplatesController.name);

  constructor(private readonly templatesService: PdfTemplatesService) {}

  /**
   * Get all available templates
   * GET /api/pdf-templates
   */
  @Get()
  async listTemplates() {
    try {
      return await this.templatesService.listTemplates();
    } catch (error) {
      this.logger.error('Failed to list templates:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to list templates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get template content by name
   * GET /api/pdf-templates/:name
   */
  @Get(':name')
  async getTemplate(@Param('name') name: string) {
    try {
      return await this.templatesService.getTemplate(name);
    } catch (error) {
      this.logger.error(`Failed to get template ${name}:`, error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Template not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Update template content
   * PUT /api/pdf-templates/:name
   */
  @Put(':name')
  async updateTemplate(
    @Param('name') name: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    try {
      return await this.templatesService.updateTemplate(name, dto.content);
    } catch (error) {
      this.logger.error(`Failed to update template ${name}:`, error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to update template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Preview template with sample data
   * POST /api/pdf-templates/:name/preview
   */
  @Post(':name/preview')
  async previewTemplate(
    @Param('name') name: string,
    @Body() dto: PreviewTemplateDto,
  ) {
    try {
      return await this.templatesService.previewTemplate(name, dto.context);
    } catch (error) {
      this.logger.error(`Failed to preview template ${name}:`, error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to preview template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}