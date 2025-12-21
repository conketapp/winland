import { Module, forwardRef } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
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
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

