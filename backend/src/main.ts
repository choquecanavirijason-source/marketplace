import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      trustProxy: true,
    }),
  );

  await app.register(helmet, {
    contentSecurityPolicy: appConfig.isProduction,
  });

  await app.register(fastifyCookie);

  const allowedOrigins = [
    appConfig.corsOrigin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || !appConfig.isProduction || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Bloqueado por CORS: origen no permitido"), false);
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "X-Correlation-Id",
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  // Configuración de Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FerroMax Marketplace 360 API')
    .setDescription('API Enterprise para la plataforma FerroMax Marketplace')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese el token JWT con formato: Bearer <token>',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Identity & Auth', 'Endpoints de autenticación, registro, OTP y recuperación de contraseña')
    .addTag('Me & Sessions', 'Gestión del perfil del usuario autenticado y sesiones activas')
    .addTag('Users Management', 'Endpoints administrativos de gestión de usuarios y roles')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
    customSiteTitle: 'FerroMax Marketplace API Docs',
  });

  app.enableShutdownHooks();

  await app.listen(appConfig.port, appConfig.host);
  logger.log(`🚀 Marketplace Enterprise Backend ejecutándose en: http://${appConfig.host}:${appConfig.port}/api/v1`);
  logger.log(`📚 Documentación Swagger disponible en: http://${appConfig.host}:${appConfig.port}/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Error fatal durante el arranque del servidor:', err);
  process.exit(1);
});

