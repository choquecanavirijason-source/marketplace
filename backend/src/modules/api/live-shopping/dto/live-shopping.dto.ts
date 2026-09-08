import { z } from 'zod';

export const createLiveEventSchema = z.object({
  title: z.string().min(3, 'Título requerido').max(250),
  description: z.string().optional(),
  streamUrl: z.string().url('URL de streaming inválida').optional().or(z.literal('')),
  scheduledAt: z.string().datetime({ message: 'Fecha y hora ISO requerida' }),
  pinnedProductId: z.number().int().positive().optional(),
});

export type CreateLiveEventDto = z.infer<typeof createLiveEventSchema>;

export const postLiveChatMessageSchema = z.object({
  userName: z.string().min(1).max(120),
  body: z.string().min(1, 'El mensaje no puede estar vacío').max(500),
});

export type PostLiveChatMessageDto = z.infer<typeof postLiveChatMessageSchema>;
