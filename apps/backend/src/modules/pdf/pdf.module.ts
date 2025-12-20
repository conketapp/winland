import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { QrcodeModule } from '../qrcode/qrcode.module';

@Module({
  imports: [PrismaModule, QrcodeModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}

