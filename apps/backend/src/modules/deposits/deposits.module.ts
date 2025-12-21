import { Module, forwardRef } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { DepositsController } from './deposits.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { CommissionsModule } from '../commissions/commissions.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [
    PrismaModule, 
    NotificationsModule, 
    SystemConfigModule, 
    CommissionsModule,
    forwardRef(() => UnitsModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}

