import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// Soft delete extension disabled - using manual deletedAt filters instead
// import { softDeleteExtension } from './prisma-soft-delete.extension';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _prismaBase: PrismaClient;
  private _prisma: ReturnType<typeof this.createPrismaClient>;

  constructor() {
    this._prismaBase = new PrismaClient();
    this._prisma = this.createPrismaClient();
  }

  private createPrismaClient() {
    // Soft delete extension disabled - using manual deletedAt filters instead
    // return this._prismaBase.$extends(softDeleteExtension);
    return this._prismaBase;
  }

  // Expose prisma client directly with transaction wrapper
  get prisma() {
    const extended = this._prisma as any;
    // Wrap $transaction to use base client for transaction callback
    // Also expose prismaBase for services that need base client
    return new Proxy(extended, {
      get: (target, prop) => {
        if (prop === '$transaction') {
          // Use base client's $transaction and pass base client to callback
          return (arg: any) => {
            if (typeof arg === 'function') {
              // Callback transaction: pass base client to callback
              return this._prismaBase.$transaction(arg);
            } else {
              // Array transaction: use base client
              return this._prismaBase.$transaction(arg);
            }
          };
        }
        if (prop === 'prismaBase') {
          // Expose base client for services that need it
          return this._prismaBase;
        }
        return target[prop];
      },
    });
  }

  // Expose base client for transactions (to avoid extension conflicts)
  get prismaBase() {
    return this._prismaBase as any;
  }

  // Delegate $transaction for TypeScript compatibility  
  get $transaction() {
    return this._prismaBase.$transaction.bind(this._prismaBase) as any;
  }

  // Delegate model access for TypeScript compatibility
  get user() { return this.prisma.user; }
  get project() { return this.prisma.project; }
  get building() { return this.prisma.building; }
  get floor() { return this.prisma.floor; }
  get unit() { return this.prisma.unit; }
  get unitType() { return this.prisma.unitType; }
  get reservation() { return this.prisma.reservation; }
  get booking() { return this.prisma.booking; }
  get deposit() { return this.prisma.deposit; }
  get paymentSchedule() { return this.prisma.paymentSchedule; }
  get transaction() { return this.prisma.transaction; }
  get commission() { return this.prisma.commission; }
  get paymentRequest() { return this.prisma.paymentRequest; }
  get systemConfig() { return this.prisma.systemConfig; }
  get pdfTemplate() { return this.prisma.pdfTemplate; }
  get notification() { return this.prisma.notification; }
  get auditLog() { return this.prisma.auditLog; }
  get oTP() { return this.prisma.oTP; }
  get sequence() { return this.prisma.sequence; }
  get document() { return this.prisma.document; }
  async onModuleInit() {
    await this._prismaBase.$connect();
    console.log('✅ Database connected');
    
    // Setup query logging middleware (optional, enable in development)
    if (process.env.ENABLE_QUERY_LOGGING === 'true' && (this._prisma as any).$use) {
      (this._prisma as any).$use(async (params: any, next: any) => {
        const start = Date.now();
        const result = await next(params);
        const duration = Date.now() - start;
        
        // Log slow queries (> 100ms)
        if (duration > 100) {
          console.warn(
            `⚠️  Slow query: ${params.model}.${params.action} - ${duration}ms`,
          );
        }
        
        return result;
      });
    }
  }

  async onModuleDestroy() {
    await this._prismaBase.$disconnect();
    console.log('❌ Database disconnected');
  }

  /**
   * Helper to add soft delete filter to where clause
   */
  excludeDeleted<T extends { deletedAt?: Date | null }>(where: T): T {
    if (where && 'deletedAt' in where === false) {
      return {
        ...where,
        deletedAt: null,
      } as T;
    }
    return where;
  }

  /**
   * Soft delete a record (set deletedAt)
   */
  async softDelete(model: string, id: string): Promise<void> {
    const modelName = model.charAt(0).toLowerCase() + model.slice(1);
    await (this.prisma as any)[modelName].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(model: string, id: string): Promise<void> {
    const modelName = model.charAt(0).toLowerCase() + model.slice(1);
    await (this.prisma as any)[modelName].update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}

