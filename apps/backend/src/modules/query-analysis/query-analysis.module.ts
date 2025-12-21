import { Module } from '@nestjs/common';
import { QueryAnalysisController } from './query-analysis.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [QueryAnalysisController],
})
export class QueryAnalysisModule {}

