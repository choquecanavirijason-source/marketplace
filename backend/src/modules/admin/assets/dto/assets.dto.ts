import { z } from 'zod';

export const createUploadSessionSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  sizeBytes: z.number().int().positive(),
  visibility: z.enum(['public', 'private']).default('public'),
});

export type CreateUploadSessionDto = z.infer<typeof createUploadSessionSchema>;
