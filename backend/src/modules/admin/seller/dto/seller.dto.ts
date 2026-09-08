import { z } from 'zod';

export const upsertSellerProfileSchema = z.object({
  storeName: z.string().min(2, 'El nombre de la tienda es requerido').max(150),
  storeSlug: z.string().min(2).max(180).optional(),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  taxId: z.string().max(60).optional(),
});

export type UpsertSellerProfileDto = z.infer<typeof upsertSellerProfileSchema>;
