import { Module } from '@nestjs/common';
import { LogisticsController } from './controllers/logistics.controller';
import { LogisticsService } from './services/logistics.service';
import { LogisticsRepository } from './repositories/logistics.repository';

@Module({
  controllers: [LogisticsController],
  providers: [LogisticsService, LogisticsRepository],
  exports: [LogisticsService, LogisticsRepository],
})
export class LogisticsModule {}
