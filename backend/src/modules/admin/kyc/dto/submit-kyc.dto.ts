import { z } from 'zod';
import { DocumentType } from '../../../../shared';

export const submitKycSchema = z.object({
  idImage: z
    .string()
    .min(50, 'La imagen frontal del documento es requerida en formato Base64 o Data URL'),
  idImageMimeType: z
    .string()
    .optional()
    .default('image/jpeg'),
  selfieVideo: z
    .string()
    .min(50, 'El video selfie con prueba de vida es requerido en formato Base64 o Data URL'),
  selfieVideoMimeType: z
    .string()
    .optional()
    .default('video/webm'),
  challenge: z
    .string()
    .optional()
    .default('blink_twice'),
  nonce: z
    .string()
    .optional()
    .default(() => crypto.randomUUID()),
  documentType: z
    .nativeEnum(DocumentType)
    .optional()
    .default(DocumentType.NATIONAL_ID),
});

export type SubmitKycDto = z.infer<typeof submitKycSchema>;
