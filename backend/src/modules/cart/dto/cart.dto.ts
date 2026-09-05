import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.number().int().positive('ID de producto inválido.'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a cero.').default(1),
  guestToken: z.string().optional(),
});

export type AddToCartDto = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative('La cantidad no puede ser negativa.'),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
