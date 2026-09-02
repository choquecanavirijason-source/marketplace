import { z } from 'zod';

export const adminUpdateStatusSchema = z.object({
  status: z.enum([
    'pendiente',
    'activa',
    'restringida',
    'suspendida',
    'en_revision',
    'rechazada',
    'eliminada_logicamente',
    // Fallback aliases
    'ACTIVE',
    'SUSPENDED',
  ]),
  reason: z.string().min(3, 'Debes proporcionar un motivo para el cambio de estado.'),
});

export type AdminUpdateStatusDto = z.infer<typeof adminUpdateStatusSchema>;

export const adminUpdateRolesSchema = z.object({
  roles: z.array(z.string()).min(1, 'Debes especificar al menos un rol.'),
});

export type AdminUpdateRolesDto = z.infer<typeof adminUpdateRolesSchema>;
