import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // NestJS Logger is used
      trustProxy: true,
    }),
  );

  // Security Headers via Helmet
  await app.register(helmet, {
    contentSecurityPolicy: appConfig.isProduction,
  });

  // Strict CORS configuration
  app.enableCors({
    origin: appConfig.corsOrigin,
    credentials: true,
  });

  // Global API Version Prefix
  app.setGlobalPrefix('api/v1');

  // Enable Graceful Shutdown
  app.enableShutdownHooks();

  await app.listen(appConfig.port, appConfig.host);
  logger.log(`🚀 Marketplace Enterprise Backend ejecutándose en: http://${appConfig.host}:${appConfig.port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error('❌ Error fatal durante el arranque del servidor:', err);
  process.exit(1);
});
