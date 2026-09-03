import { z } from 'zod';
import { UserRole, UserStatus } from '../../enums';

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  status: z.nativeEnum(UserStatus),
  type: z.nativeEnum(UserRole),
  role: z.string(),
  fullName: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;
