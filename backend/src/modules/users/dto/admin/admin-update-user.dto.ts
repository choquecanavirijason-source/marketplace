import { z } from 'zod';
import { UserRole, UserStatus, KycLevel } from '../../../../shared';

export const adminUpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional().nullable(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  kycLevel: z.nativeEnum(KycLevel).optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;
