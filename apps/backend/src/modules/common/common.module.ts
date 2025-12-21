import { Module, Global } from '@nestjs/common';
import { CodeGeneratorService } from './services/code-generator.service';
import { CacheService } from '../../common/services/cache.service';
import { TriggerService } from '../../common/services/trigger.service';
import { QueryAnalysisService } from '../../common/services/query-analysis.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CodeGeneratorService, CacheService, TriggerService, QueryAnalysisService],
  exports: [CodeGeneratorService, CacheService, TriggerService, QueryAnalysisService],
})
export class CommonModule {}

