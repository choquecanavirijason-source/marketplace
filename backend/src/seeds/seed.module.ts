import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { DrizzleModule } from '../infrastructure/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
