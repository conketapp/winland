import { IsString, IsEnum, IsOptional, IsNumber, MaxLength, Min } from 'class-validator';

export enum DocumentTypeEnum {
  CMND_FRONT = 'CMND_FRONT',
  CMND_BACK = 'CMND_BACK',
  PASSPORT = 'PASSPORT',
  MARRIAGE_CERT = 'MARRIAGE_CERT',
  AUTHORIZATION = 'AUTHORIZATION',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  PAYMENT_PROOF = 'PAYMENT_PROOF',
  HANDOVER_REPORT = 'HANDOVER_REPORT',
  UNIT_IMAGE = 'UNIT_IMAGE',
  OTHER = 'OTHER',
}

export enum EntityTypeEnum {
  DEPOSIT = 'deposit',
  BOOKING = 'booking',
  RESERVATION = 'reservation',
  UNIT = 'unit',
  TRANSACTION = 'transaction',
  USER = 'user',
}

export class CreateDocumentDto {
  @IsString()
  @IsEnum(EntityTypeEnum)
  entityType: string; // 'deposit', 'booking', 'reservation', 'unit', 'transaction', 'user'

  @IsString()
  entityId: string; // ID của entity liên quan

  @IsString()
  @IsEnum(DocumentTypeEnum)
  documentType: string;

  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string; // URL sau khi upload

  @IsNumber()
  @Min(0)
  fileSize: number; // bytes

  @IsString()
  mimeType: string; // 'image/jpeg', 'application/pdf', etc.

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>; // Additional metadata
}
