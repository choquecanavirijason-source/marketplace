import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { databaseConfig } from '../../config';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  private client!: postgres.Sql;
  public db!: PostgresJsDatabase<typeof schema>;

  onModuleInit() {
    this.logger.log('Inicializando conexión a PostgreSQL con Drizzle ORM...');
    this.client = postgres(databaseConfig.url, {
      max: databaseConfig.maxConnections,
      idle_timeout: databaseConfig.idleTimeoutMillis / 1000,
      connect_timeout: databaseConfig.connectionTimeoutMillis / 1000,
      onnotice: () => {}, // Suppress notices in production
    });

    this.db = drizzle(this.client, { schema });
    this.logger.log('✅ Conexión con PostgreSQL establecida.');
  }

  async onModuleDestroy() {
    this.logger.log('Cerrando pool de conexiones de PostgreSQL...');
    await this.client.end();
  }
}
