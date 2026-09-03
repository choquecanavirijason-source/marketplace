import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido.').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(100, 'La contraseña no puede exceder los 100 caracteres.'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').trim(),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres.').trim(),
  phone: z.string().min(6, 'Número de teléfono inválido.').optional(),
  type: z.enum(['buyer', 'seller_individual', 'seller_empresa', 'seller']).optional().default('buyer'),
  role: z.string().optional(),
  legalName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  legalType: z.string().optional(),
  fiscalAddress: z.string().optional(),
  termsAccepted: z.boolean().optional().default(true),
  name: z.string().optional(),
  mobileNumber: z.string().optional(),
  mobile_number: z.string().optional(),
  address: z.string().optional(),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
