import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().max(100).optional(),
  country: z.string().min(1, 'El país es requerido.').max(100),
  province: z.string().min(1, 'La provincia es requerida.').max(100),
  city: z.string().min(1, 'La ciudad es requerida.').max(100),
  street: z.string().min(1, 'La calle es requerida.').max(255),
  number: z.string().min(1, 'La altura/número es requerida.').max(50),
  zip: z.string().min(1, 'El código postal es requerido.').max(20),
  isDefault: z.boolean().optional(),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
