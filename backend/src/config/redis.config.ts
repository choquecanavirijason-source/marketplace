import { env } from './env-schema';

export const redisConfig = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};
