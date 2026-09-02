import { env } from './env-schema';

export const appConfig = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  corsOrigin: env.CORS_ORIGIN,
  isProduction: env.NODE_ENV === 'production',
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
};
