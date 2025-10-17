import { Module } from '@nestjs/common';
import { UnitTypesService } from './unit-types.service';
import { UnitTypesController } from './unit-types.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UnitTypesController],
  providers: [UnitTypesService],
  exports: [UnitTypesService],
})
export class UnitTypesModule {}

