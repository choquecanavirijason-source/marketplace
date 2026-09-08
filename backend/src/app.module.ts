import { Module, MiddlewareConsumer, NestModule, ClassSerializerInterceptor } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { DrizzleModule } from './infrastructure/database/drizzle.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { StorageModule } from './infrastructure/storage/storage.module';

import { AdminModule } from './modules/admin/admin.module';
import { ApiModule } from './modules/api/api.module';

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
    AdminModule,
    ApiModule,
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
