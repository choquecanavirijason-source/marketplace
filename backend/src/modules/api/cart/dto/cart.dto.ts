import { z } from 'zod';

export const addToCartSchema = z
  .object({
    productId: z.number().int().positive().optional(),
    product_id: z.number().int().positive().optional(),
    quantity: z.number().int().positive('La cantidad debe ser mayor a cero.').default(1),
    guestToken: z.string().optional(),
    guest_token: z.string().optional(),
  })
  .transform((val) => ({
    productId: val.productId ?? val.product_id ?? 0,
    quantity: val.quantity,
    guestToken: val.guestToken ?? val.guest_token,
  }));

export type AddToCartDto = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative('La cantidad no puede ser negativa.'),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
