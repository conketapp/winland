import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { CommissionsModule } from './modules/commissions/commissions.module';
import { QrcodeModule } from './modules/qrcode/qrcode.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { CommonModule } from './modules/common/common.module';
import { QueryAnalysisModule } from './modules/query-analysis/query-analysis.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'], // Try multiple paths
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule, // Global module for shared services
    AuthModule,
    DashboardModule,
    ReportsModule,
    // Model B Modules (Complete MVP Flow)
    ProjectsModule,
    UnitsModule,
    UnitTypesModule,
    ReservationsModule,
    BookingsModule, // Added - MVP required
    DepositsModule,
    TransactionsModule,
    PaymentRequestsModule,
    CommissionsModule,
    QrcodeModule,
    PdfModule,
    DocumentsModule,
    SystemConfigModule,
    UsersModule,
    NotificationsModule,
    AuditLogModule,
    QueryAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
