import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PdfTemplatesController } from './pdf-templates.controller';
import { PdfTemplatesService } from './pdf-templates.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { QrcodeModule } from '../qrcode/qrcode.module';

@Module({
  imports: [PrismaModule, QrcodeModule],
  controllers: [PdfController, PdfTemplatesController],
  providers: [PdfService, PdfTemplatesService],
  exports: [PdfService, PdfTemplatesService],
})
export class PdfModule {}

