import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es requerido.').max(150),
  parentId: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

export const categoryQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type CategoryQueryDto = z.infer<typeof categoryQuerySchema>;
