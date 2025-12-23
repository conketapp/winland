import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export enum DocumentStatusEnum {
  DRAFT = 'DRAFT',
  FINAL = 'FINAL',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateDocumentDto {
  @IsString()
  @IsEnum(DocumentStatusEnum)
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}
