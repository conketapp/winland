import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { FileUploadUtil, FileUploadResult } from './utils/file-upload.util';
import { PaginationOptions, PaginationResult } from '../../common/utils/pagination.util';
import { DocumentType, DocumentStatus } from '@prisma/client';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Upload and create document
   */
  async create(
    dto: CreateDocumentDto,
    uploadedBy: string,
    file?: Express.Multer.File,
  ) {
    // Validate entity exists
    await this.validateEntity(dto.entityType, dto.entityId, uploadedBy);

    // If file provided, upload it
    let fileResult: FileUploadResult | undefined;
    if (file) {
      fileResult = await FileUploadUtil.saveFile(file, {
        subfolder: dto.entityType,
      });
      // Override DTO with actual file info
      dto.fileUrl = fileResult.url;
      dto.fileName = fileResult.filename;
      dto.fileSize = fileResult.size;
      dto.mimeType = fileResult.mimeType;
    }

    // Create document
    const document = await this.prisma.document.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        documentType: dto.documentType as DocumentType,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        fileSize: BigInt(dto.fileSize),
        mimeType: dto.mimeType,
        description: dto.description,
        uploadedBy,
        status: 'DRAFT',
        metadata: dto.metadata || {},
      },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Document created: ${document.id} for ${dto.entityType}:${dto.entityId}`);
    
    // Convert BigInt fileSize to number for JSON serialization
    return {
      id: document.id,
      entityType: document.entityType,
      entityId: document.entityId,
      documentType: document.documentType,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      fileSize: typeof document.fileSize === 'bigint' ? Number(document.fileSize) : document.fileSize,
      mimeType: document.mimeType,
      version: document.version,
      status: document.status,
      description: document.description,
      uploadedBy: document.uploadedBy,
      uploadedAt: document.uploadedAt,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      uploader: document.uploader,
    };
  }

  /**
   * Upload multiple files and create documents
   */
  async createMultiple(
    entityType: string,
    entityId: string,
    documentType: string,
    files: Express.Multer.File[],
    uploadedBy: string,
    description?: string,
  ) {
    // Validate entity exists
    await this.validateEntity(entityType, entityId, uploadedBy);

    // Upload all files
    const fileResults = await FileUploadUtil.saveFiles(files, {
      subfolder: entityType,
    });

    // Create documents
    const documents = await Promise.all(
      fileResults.map((fileResult) =>
        this.prisma.document.create({
          data: {
            entityType,
            entityId,
            documentType: documentType as DocumentType,
            fileName: fileResult.filename,
            fileUrl: fileResult.url,
            fileSize: BigInt(fileResult.size),
            mimeType: fileResult.mimeType,
            description,
            uploadedBy,
            status: 'DRAFT',
            metadata: {},
          },
          include: {
            uploader: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        }),
      ),
    );

    this.logger.log(`Created ${documents.length} documents for ${entityType}:${entityId}`);
    
    // Convert BigInt fileSize to number for JSON serialization
    return documents.map((doc: any) => ({
      ...doc,
      fileSize: typeof doc.fileSize === 'bigint' ? Number(doc.fileSize) : doc.fileSize,
    }));
  }

  /**
   * Find all documents with filters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findAll(query: QueryDocumentDto): Promise<PaginationResult<any>> {
    const where: any = {
      deletedAt: null,
    };

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.documentType) {
      where.documentType = query.documentType;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.uploadedBy) {
      where.uploadedBy = query.uploadedBy;
    }

    const paginationOptions: PaginationOptions = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
    };

    const skip = (paginationOptions.page - 1) * paginationOptions.pageSize;
    const take = paginationOptions.pageSize;

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(total / paginationOptions.pageSize);
    
    // Convert BigInt fileSize to number for JSON serialization
    // Also ensure all fields are properly serializable
    const itemsWithSerializedFileSize = items.map((item: any) => {
      const serialized: any = {
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        documentType: item.documentType,
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        fileSize: typeof item.fileSize === 'bigint' ? Number(item.fileSize) : item.fileSize,
        mimeType: item.mimeType,
        version: item.version,
        status: item.status,
        description: item.description,
        uploadedBy: item.uploadedBy,
        uploadedAt: item.uploadedAt,
        metadata: item.metadata,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        uploader: item.uploader,
      };
      return serialized;
    });
    
    return {
      items: itemsWithSerializedFileSize,
      total,
      page: paginationOptions.page,
      pageSize: paginationOptions.pageSize,
      totalPages,
      hasNext: paginationOptions.page < totalPages,
      hasPrev: paginationOptions.page > 1,
    };
  }

  /**
   * Find documents by entity
   */
  async findByEntity(entityType: string, entityId: string) {
    const documents = await this.prisma.document.findMany({
      where: {
        entityType,
        entityId,
        deletedAt: null,
      },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert BigInt fileSize to number for JSON serialization
    return documents.map((doc: any) => ({
      ...doc,
      fileSize: typeof doc.fileSize === 'bigint' ? Number(doc.fileSize) : doc.fileSize,
    }));
  }

  /**
   * Find document by ID
   */
  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!doc || doc.deletedAt) {
      throw new NotFoundException('Document not found');
    }

    // Convert BigInt fileSize to number for JSON serialization
    return {
      ...doc,
      fileSize: typeof doc.fileSize === 'bigint' ? Number(doc.fileSize) : doc.fileSize,
    };
  }

  /**
   * Update document
   */
  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    const document = await this.findOne(id);

    // Check permission (only uploader or admin can update)
    // Note: In production, add role check for admin
    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('You can only update documents you uploaded');
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        status: dto.status as DocumentStatus | undefined,
        description: dto.description,
        metadata: dto.metadata || document.metadata,
      },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Document updated: ${id}`);
    
    // Convert BigInt fileSize to number for JSON serialization
    return {
      id: updated.id,
      entityType: updated.entityType,
      entityId: updated.entityId,
      documentType: updated.documentType,
      fileName: updated.fileName,
      fileUrl: updated.fileUrl,
      fileSize: typeof updated.fileSize === 'bigint' ? Number(updated.fileSize) : updated.fileSize,
      mimeType: updated.mimeType,
      version: updated.version,
      status: updated.status,
      description: updated.description,
      uploadedBy: updated.uploadedBy,
      uploadedAt: updated.uploadedAt,
      metadata: updated.metadata,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      uploader: updated.uploader,
    };
  }

  /**
   * Delete document (soft delete)
   */
  async remove(id: string, userId: string) {
    const document = await this.findOne(id);

    // Check permission
    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('You can only delete documents you uploaded');
    }

    // Soft delete
    await this.prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Optionally delete file from storage
    // await FileUploadUtil.deleteFile(document.fileUrl);

    this.logger.log(`Document deleted: ${id}`);
    return { message: 'Document deleted successfully' };
  }

  /**
   * Get document versions (same entity + documentType)
   */
  async getVersions(entityType: string, entityId: string, documentType: string) {
    const documents = await this.prisma.document.findMany({
      where: {
        entityType,
        entityId,
        documentType: documentType as DocumentType,
        deletedAt: null,
      },
      orderBy: {
        version: 'desc',
      },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
    
    // Convert BigInt fileSize to number for JSON serialization
    return documents.map((doc: any) => {
      const serialized: any = {
        id: doc.id,
        entityType: doc.entityType,
        entityId: doc.entityId,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: typeof doc.fileSize === 'bigint' ? Number(doc.fileSize) : doc.fileSize,
        mimeType: doc.mimeType,
        version: doc.version,
        status: doc.status,
        description: doc.description,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt,
        metadata: doc.metadata,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        uploader: doc.uploader,
      };
      return serialized;
    });
  }

  /**
   * Validate entity exists and user has access
   */
  private async validateEntity(entityType: string, entityId: string, userId: string): Promise<void> {
    let entity: any;

    switch (entityType) {
      case 'deposit':
        entity = await this.prisma.deposit.findUnique({
          where: { id: entityId },
          select: { id: true, ctvId: true },
        });
        if (entity && entity.ctvId !== userId) {
          // Check if user is admin (in production, use role check)
          throw new ForbiddenException('You can only upload documents for your own deposits');
        }
        break;

      case 'booking':
        entity = await this.prisma.booking.findUnique({
          where: { id: entityId },
          select: { id: true, ctvId: true },
        });
        if (entity && entity.ctvId !== userId) {
          throw new ForbiddenException('You can only upload documents for your own bookings');
        }
        break;

      case 'reservation':
        entity = await this.prisma.reservation.findUnique({
          where: { id: entityId },
          select: { id: true, ctvId: true },
        });
        if (entity && entity.ctvId !== userId) {
          throw new ForbiddenException('You can only upload documents for your own reservations');
        }
        break;

      case 'unit':
        entity = await this.prisma.unit.findUnique({
          where: { id: entityId },
          select: { id: true },
        });
        // Units are accessible to all authenticated users
        break;

      case 'transaction':
        entity = await this.prisma.transaction.findUnique({
          where: { id: entityId },
          select: { id: true },
        });
        // Transactions access control handled elsewhere
        break;

      case 'user':
        // Users can upload their own documents
        if (entityId !== userId) {
          throw new ForbiddenException('You can only upload documents for your own profile');
        }
        entity = await this.prisma.user.findUnique({
          where: { id: entityId },
          select: { id: true },
        });
        break;

      default:
        throw new BadRequestException(`Invalid entity type: ${entityType}`);
    }

    if (!entity) {
      throw new NotFoundException(`${entityType} with id ${entityId} not found`);
    }
  }
}
