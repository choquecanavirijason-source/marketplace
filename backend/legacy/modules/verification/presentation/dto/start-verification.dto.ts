import { z } from 'zod';
import { DocumentType } from '../../../../shared';

export const startVerificationSchema = z.object({
  targetLevel: z.number().int().min(1).max(3).default(1),
});

export const uploadDocumentSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  mimeType: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  fileSizeBytes: z.number().int().positive().max(15 * 1024 * 1024), // Max 15MB
});

export type StartVerificationDto = z.infer<typeof startVerificationSchema>;
export type UploadDocumentDto = z.infer<typeof uploadDocumentSchema>;
