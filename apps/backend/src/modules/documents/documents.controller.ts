import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Logger,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Upload single file and create document
   * POST /api/documents
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    try {
      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }

      const document = await this.documentsService.create(
        dto,
        req.user.userId,
        file,
      );

      return {
        document,
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      this.logger.error('Failed to upload document:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to upload document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload multiple files and create documents
   * POST /api/documents/bulk
   */
  @Post('bulk')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async createMultiple(
    @Body()
    body: {
      entityType: string;
      entityId: string;
      documentType: string;
      description?: string;
    },
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('At least one file is required', HttpStatus.BAD_REQUEST);
      }

      const documents = await this.documentsService.createMultiple(
        body.entityType,
        body.entityId,
        body.documentType,
        files,
        req.user.userId,
        body.description,
      );

      return {
        documents,
        count: documents.length,
        message: `${documents.length} document(s) uploaded successfully`,
      };
    } catch (error) {
      this.logger.error('Failed to upload documents:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to upload documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all documents with filters
   * GET /api/documents
   */
  @Get()
  async findAll(@Query() query: QueryDocumentDto) {
    try {
      return await this.documentsService.findAll(query);
    } catch (error) {
      this.logger.error('Failed to get documents:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get documents by entity
   * GET /api/documents/entity/:entityType/:entityId
   */
  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    try {
      const documents = await this.documentsService.findByEntity(
        entityType,
        entityId,
      );
      return {
        documents,
        count: documents.length,
      };
    } catch (error) {
      this.logger.error('Failed to get documents by entity:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get document by ID
   * GET /api/documents/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.documentsService.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to get document ${id}:`, error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Document not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Get document versions
   * GET /api/documents/:entityType/:entityId/:documentType/versions
   */
  @Get(':entityType/:entityId/:documentType/versions')
  async getVersions(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('documentType') documentType: string,
  ) {
    try {
      const versions = await this.documentsService.getVersions(
        entityType,
        entityId,
        documentType,
      );
      return {
        versions,
        count: versions.length,
      };
    } catch (error) {
      this.logger.error('Failed to get document versions:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get versions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update document
   * PUT /api/documents/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @Request() req: any,
  ) {
    try {
      return await this.documentsService.update(id, dto, req.user.userId);
    } catch (error) {
      this.logger.error(`Failed to update document ${id}:`, error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to update document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete document
   * DELETE /api/documents/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.documentsService.remove(id, req.user.userId);
    } catch (error) {
      this.logger.error(`Failed to delete document ${id}:`, error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to delete document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
