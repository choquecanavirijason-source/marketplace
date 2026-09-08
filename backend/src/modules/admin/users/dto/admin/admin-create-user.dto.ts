import { z } from 'zod';
import { UserRole, UserStatus, KycLevel } from '../../../../../shared';

export const adminCreateUserSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  phone: z.string().optional().nullable(),
  role: z.nativeEnum(UserRole).default(UserRole.BUYER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  kycLevel: z.nativeEnum(KycLevel).default(KycLevel.NONE),
  emailVerified: z.boolean().default(true),
});

export type AdminCreateUserDto = z.infer<typeof adminCreateUserSchema>;
