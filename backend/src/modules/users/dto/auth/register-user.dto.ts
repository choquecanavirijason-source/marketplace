import { z } from 'zod';

export const registerUserSchema = z
  .object({
    email: z.string().email('Formato de correo electrónico inválido.').toLowerCase().trim(),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(100, 'La contraseña no puede exceder los 100 caracteres.'),
    name: z.string().trim().optional(),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    phone: z.string().min(6, 'Número de teléfono inválido.').optional(),
    type: z.enum(['buyer', 'seller_individual', 'seller_company', 'seller']).optional().default('buyer'),
    role: z.string().optional(),
    legalName: z.string().optional(),
    tradeName: z.string().optional(),
    taxId: z.string().optional(),
    legalType: z.string().optional(),
    fiscalAddress: z.string().optional(),
    termsAccepted: z.boolean().optional().default(true),
    mobileNumber: z.string().optional(),
    mobile_number: z.string().optional(),
    country: z.string().optional(),
    phoneCountry: z.string().optional(),
    address: z.string().optional(),
  })
  .refine((data) => Boolean(data.name?.trim() || data.firstName?.trim()), {
    message: 'Debes ingresar tu nombre o nombre completo.',
    path: ['name'],
  });

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
