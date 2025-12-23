/**
 * PDF Template DTOs
 */

import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateTemplateDto {
  @IsString()
  content: string;
}

export class PreviewTemplateDto {
  @IsString()
  templateName: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}