import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  orderId: z.number().int().positive('ID de orden requerido.'),
  paymentMethod: z.enum(['card', 'transfer', 'cash', 'crypto']).default('card'),
  provider: z.string().default('simulator'),
});

export type CreatePaymentIntentDto = z.infer<typeof createPaymentIntentSchema>;

export const processPaymentSchema = z.object({
  orderId: z.number().int().positive('ID de orden requerido.'),
  paymentId: z.number().int().positive().optional(),
  providerPaymentId: z.string().optional(),
  status: z.enum(['approved', 'rejected', 'pending']).default('approved'),
  notes: z.string().optional(),
});

export type ProcessPaymentDto = z.infer<typeof processPaymentSchema>;
