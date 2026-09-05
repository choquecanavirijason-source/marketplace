import { Module } from '@nestjs/common';
import { LiveShoppingController } from './controllers/live-shopping.controller';
import { LiveShoppingService } from './services/live-shopping.service';
import { LiveShoppingRepository } from './repositories/live-shopping.repository';

@Module({
  controllers: [LiveShoppingController],
  providers: [LiveShoppingService, LiveShoppingRepository],
  exports: [LiveShoppingService, LiveShoppingRepository],
})
export class LiveShoppingModule {}
