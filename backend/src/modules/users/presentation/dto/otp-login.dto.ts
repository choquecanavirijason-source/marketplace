import { z } from 'zod';

export const otpLoginSchema = z.object({
  phone: z.string().min(6).optional(),
  email: z.string().email().optional(),
  code: z.string().min(4, 'Código OTP requerido.').max(10),
  deviceId: z.string().optional(),
}).refine((data) => data.phone || data.email, {
  message: 'Se requiere teléfono o correo electrónico para iniciar sesión con OTP.',
});

export type OtpLoginDto = z.infer<typeof otpLoginSchema>;
