import { Module } from '@nestjs/common';
import { CommunityController } from './controllers/community.controller';
import { CommunityService } from './services/community.service';
import { CommunityRepository } from './repositories/community.repository';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRepository],
  exports: [CommunityService, CommunityRepository],
})
export class CommunityModule {}
