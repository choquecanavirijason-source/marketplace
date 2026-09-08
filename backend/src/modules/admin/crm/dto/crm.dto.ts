import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().default('web'),
  notes: z.string().optional(),
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;

export const updateLeadStatusSchema = z.object({
  status: z.enum(['nuevo', 'contactado', 'calificado', 'descartado']),
  score: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export type UpdateLeadStatusDto = z.infer<typeof updateLeadStatusSchema>;
