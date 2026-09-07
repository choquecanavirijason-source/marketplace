import { Module, MiddlewareConsumer, NestModule, ClassSerializerInterceptor } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { DrizzleModule } from './infrastructure/database/drizzle.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { StorageModule } from './infrastructure/storage/storage.module';

import { UsersModule } from './modules/users/users.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SearchModule } from './modules/search/search.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { SellerModule } from './modules/seller/seller.module';
import { CrmModule } from './modules/crm/crm.module';
import { CommunityModule } from './modules/community/community.module';
import { LiveShoppingModule } from './modules/live-shopping/live-shopping.module';
import { SecurityModule } from './modules/security/security.module';
import { AiModule } from './modules/ai/ai.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AdminModule } from './modules/admin/admin.module';

import { ScheduledTasksModule } from './jobs/scheduled-tasks.module';

import {
  AllExceptionsFilter,
  LoggingInterceptor,
  TimeoutInterceptor,
  TransformInterceptor,
  CorrelationIdMiddleware,
} from './common';

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
    MailModule,
    StorageModule,
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
      useClass: ClassSerializerInterceptor,
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
