import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UnitsModule } from './modules/units/units.module';
import { UnitTypesModule } from './modules/unit-types/unit-types.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { PaymentRequestsModule } from './modules/payment-requests/payment-requests.module';
import { QrcodeModule } from './modules/qrcode/qrcode.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DashboardModule,
    // Model B Modules (Complete MVP Flow)
    ProjectsModule,
    UnitsModule,
    UnitTypesModule,
    ReservationsModule,
    BookingsModule, // Added - MVP required
    DepositsModule,
    TransactionsModule,
    PaymentRequestsModule,
    QrcodeModule,
    PdfModule,
    SystemConfigModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
