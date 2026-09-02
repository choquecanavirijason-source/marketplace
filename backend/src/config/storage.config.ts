import { env } from './env-schema';

export const storageConfig = {
  endpoint: env.STORAGE_ENDPOINT,
  bucket: env.STORAGE_BUCKET,
  region: env.STORAGE_REGION,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Crucial for MinIO and R2 compatibility
};
