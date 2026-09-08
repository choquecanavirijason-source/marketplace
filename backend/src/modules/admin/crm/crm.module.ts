import { Module } from '@nestjs/common';
import { CrmController } from './controllers/crm.controller';
import { CrmService } from './services/crm.service';
import { CrmRepository } from './repositories/crm.repository';

@Module({
  controllers: [CrmController],
  providers: [CrmService, CrmRepository],
  exports: [CrmService, CrmRepository],
})
export class CrmModule {}
