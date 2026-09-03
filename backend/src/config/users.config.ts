import { env } from './env-schema';

export const usersConfig = {
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  otpExpiresMinutes: 10,
  maxLoginAttempts: 5,
  lockoutMinutes: 15,
  defaultLanguage: 'es',
  defaultCurrency: 'ARS',
};
