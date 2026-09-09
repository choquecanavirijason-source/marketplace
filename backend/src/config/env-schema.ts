import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  DATABASE_URL: z
    .string()
    .default('postgres://postgres:postgres@localhost:5432/marketplace'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres')
    .default('marketplace_access_secret_super_secure_key_32chars_min'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres')
    .default('marketplace_refresh_secret_super_secure_key_32chars_min'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  STORAGE_ENDPOINT: z.string().default('http://localhost:9000'),
  STORAGE_BUCKET: z.string().default('marketplace-documents'),
  STORAGE_ACCESS_KEY_ID: z.string().default('minioadmin'),
  STORAGE_SECRET_ACCESS_KEY: z.string().default('minioadmin'),
  STORAGE_REGION: z.string().default('auto'),

  KYC_WEBHOOK_SECRET: z.string().default('kyc_webhook_signature_secret_test'),

  RESEND_API_KEY: z.string().optional().default('re_mock_api_key'),
  WHATSAPP_API_TOKEN: z.string().optional().default('mock_wa_token'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default('mock_wa_phone_id'),

  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().default('http://localhost:3001'),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),

  FACEBOOK_APP_ID: z.string().optional().default(''),
  FACEBOOK_APP_SECRET: z.string().optional().default(''),

  APPLE_CLIENT_ID: z.string().optional().default(''),
  APPLE_TEAM_ID: z.string().optional().default(''),
  APPLE_KEY_ID: z.string().optional().default(''),
  APPLE_PRIVATE_KEY: z.string().optional().default(''),

  BIOMETRICAL_VERIFY_URL: z
    .string()
    .default('http://biometrical-verify-oy4fcb-2818e0-169-58-211-184.sslip.io'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Error de validación en variables de entorno:', result.error.format());
    throw new Error('Configuración de entorno inválida');
  }
  return result.data;
};

export const env = validateEnv();
