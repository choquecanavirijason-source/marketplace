import { z } from 'zod';

export const createConversationSchema = z.object({
  channel: z.enum(['webchat', 'whatsapp', 'email']).default('webchat'),
  subject: z.string().min(3, 'Asunto requerido').max(250),
  initialMessage: z.string().min(1, 'Mensaje requerido'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export type CreateConversationDto = z.infer<typeof createConversationSchema>;

export const postMessageSchema = z.object({
  body: z.string().min(1, 'El cuerpo del mensaje no puede estar vacío'),
  isAiGenerated: z.boolean().default(false),
});

export type PostMessageDto = z.infer<typeof postMessageSchema>;
