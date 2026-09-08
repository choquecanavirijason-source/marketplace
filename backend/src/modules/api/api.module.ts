import { Module } from '@nestjs/common';
import { ApiCatalogModule } from './catalog/api-catalog.module';
import { CartModule } from './cart/cart.module';
import { PaymentsModule } from './payments/payments.module';
import { LogisticsModule } from './logistics/logistics.module';
import { AiModule } from './ai/ai.module';
import { LiveShoppingModule } from './live-shopping/live-shopping.module';

@Module({
  imports: [
    ApiCatalogModule,
    CartModule,
    PaymentsModule,
    LogisticsModule,
    AiModule,
    LiveShoppingModule,
  ],
  exports: [
    ApiCatalogModule,
    CartModule,
    PaymentsModule,
    LogisticsModule,
    AiModule,
    LiveShoppingModule,
  ],
})
export class ApiModule {}
