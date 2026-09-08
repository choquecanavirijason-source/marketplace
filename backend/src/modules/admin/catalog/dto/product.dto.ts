import { z } from 'zod';

const money = z.union([z.number().finite(), z.string().regex(/^\d+(\.\d{1,2})?$/)]);

const imageInput = z.object({
  url: z.string().min(1).max(1000),
  alt: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre del producto es requerido.').max(255),
  categoryId: z.number().int().positive(),
  price: money,
  originalPrice: money.nullable().optional(),
  tag: z.string().max(80).nullable().optional(),
  badge: z.string().max(80).nullable().optional(),
  sku: z.string().max(100).nullable().optional(),
  stock: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
  description: z.string().nullable().optional(),
  longDescription: z.string().nullable().optional(),
  weight: z.string().max(60).nullable().optional(),
  warranty: z.string().max(160).nullable().optional(),
  image: z.string().max(1000).nullable().optional(),
  images: z.array(imageInput).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

export type ProductQueryDto = z.infer<typeof productQuerySchema>;

export const productStatusSchema = z.object({
  is_active: z.boolean(),
});

export type ProductStatusDto = z.infer<typeof productStatusSchema>;
