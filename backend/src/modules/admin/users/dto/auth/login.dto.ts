import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido.').toLowerCase().trim(),
  password: z.string().min(1, 'La contraseña es requerida.'),
  deviceId: z.string().optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;
