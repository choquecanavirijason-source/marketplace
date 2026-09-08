import { z } from 'zod';
import { UserRole, UserStatus } from '../../../../../shared';

export const queryUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  sortBy: z.enum(['name', 'email', 'phone', 'role', 'status', 'completion', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type QueryUsersDto = z.infer<typeof queryUsersSchema>;
