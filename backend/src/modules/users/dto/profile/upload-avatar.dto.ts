import { z } from 'zod';

export const uploadAvatarSchema = z.object({
  image: z
    .string()
    .min(10, 'La imagen en formato base64 o Data URL es requerida')
    .refine(
      (val) => val.startsWith('data:image/') || val.length > 50,
      'Formato de imagen no válido',
    ),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/i, 'Tipo MIME de imagen no soportado')
    .optional()
    .default('image/webp'),
});

export type UploadAvatarDto = z.infer<typeof uploadAvatarSchema>;
