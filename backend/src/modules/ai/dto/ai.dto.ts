import { z } from 'zod';

export const aiAssistantPromptSchema = z.object({
  query: z.string().min(2, 'Consulta requerida').max(1000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

export type AiAssistantPromptDto = z.infer<typeof aiAssistantPromptSchema>;
