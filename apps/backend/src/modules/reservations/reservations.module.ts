import { Module, forwardRef } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [
    PrismaModule, 
    NotificationsModule, 
    SystemConfigModule,
    forwardRef(() => UnitsModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}

