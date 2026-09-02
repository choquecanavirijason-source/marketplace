import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Infrastructure Modules
import { DrizzleModule } from './infrastructure/database/drizzle.module';
import { CacheModule } from './infrastructure/cache/cache.module';

// 15 Domain Modules (marketplace.md)
import { UsersModule } from './modules/users/users.module'; // Módulo 1
import { CatalogModule } from './modules/catalog/catalog.module'; // Módulo 2
import { SearchModule } from './modules/search/search.module'; // Módulo 3
import { CartModule } from './modules/cart/cart.module'; // Módulo 4
import { PaymentsModule } from './modules/payments/payments.module'; // Módulo 5
import { OrdersModule } from './modules/orders/orders.module'; // Módulo 6
import { LogisticsModule } from './modules/logistics/logistics.module'; // Módulo 7
import { SellerModule } from './modules/seller/seller.module'; // Módulo 8
import { CrmModule } from './modules/crm/crm.module'; // Módulo 9
import { CommunityModule } from './modules/community/community.module'; // Módulo 10
import { LiveShoppingModule } from './modules/live-shopping/live-shopping.module'; // Módulo 11
import { SecurityModule } from './modules/security/security.module'; // Módulo 12
import { AiModule } from './modules/ai/ai.module'; // Módulo 13
import { AssetsModule } from './modules/assets/assets.module'; // Módulo 14
import { AdminModule } from './modules/admin/admin.module'; // Módulo 15

import { ScheduledTasksModule } from './jobs/scheduled-tasks.module';

// Common
import {
  AllExceptionsFilter,
  LoggingInterceptor,
  TimeoutInterceptor,
  TransformInterceptor,
  CorrelationIdMiddleware,
} from './common';

// Default App Controller & Service
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),
    DrizzleModule,
    CacheModule,
    // 15 Monolithic Monolith Bounded Contexts
    UsersModule,
    CatalogModule,
    SearchModule,
    CartModule,
    PaymentsModule,
    OrdersModule,
    LogisticsModule,
    SellerModule,
    CrmModule,
    CommunityModule,
    LiveShoppingModule,
    SecurityModule,
    AiModule,
    AssetsModule,
    AdminModule,
    ScheduledTasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
