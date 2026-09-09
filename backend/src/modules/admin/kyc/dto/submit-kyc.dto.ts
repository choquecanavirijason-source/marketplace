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
    .min(1, 'El código del reto biométrico es requerido')
    .default('blink_twice'),
  nonce: z
    .string()
    .min(1, 'El nonce criptográfico anti-replay es requerido'),
  documentType: z
    .nativeEnum(DocumentType)
    .optional()
    .default(DocumentType.NATIONAL_ID),
});

export type SubmitKycDto = z.infer<typeof submitKycSchema>;
