import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from '../../config';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client!: Redis;
  private isConnected = false;

  onModuleInit() {
    this.logger.log('Conectando a Redis Cache...');
    this.client = new Redis(redisConfig.url, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('⚠️ No se pudo conectar a Redis tras 3 intentos. Modo fallback activo.');
          return null;
        }
        return Math.min(times * 100, 1000);
      },
      lazyConnect: true,
    });

    this.client
      .connect()
      .then(() => {
        this.isConnected = true;
        this.logger.log('✅ Conexión con Redis Cache establecida.');
      })
      .catch((err) => {
        this.isConnected = false;
        this.logger.warn(`⚠️ Redis offline (${err.message}). Operando en modo degradado.`);
      });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`Error de conexión Redis: ${err.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      this.logger.warn(`Error al guardar en cache [${key}]: ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.warn(`Error al eliminar de cache [${key}]: ${(err as Error).message}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      this.logger.warn(`Error al invalidar patrón [${pattern}]: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.quit();
    }
  }
}
