import { env } from './env-schema';

export const databaseConfig = {
  url: env.DATABASE_URL,
  maxConnections: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};
