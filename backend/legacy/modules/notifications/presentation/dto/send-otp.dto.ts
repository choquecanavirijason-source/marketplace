import { z } from 'zod';

export const sendOtpSchema = z.object({
  destination: z.string().min(3, 'El destino (email o teléfono) es requerido'),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']).default('EMAIL'),
});

export const verifyOtpSchema = z.object({
  destination: z.string().min(3, 'El destino es requerido'),
  otp: z.string().length(6, 'El código OTP debe ser de 6 dígitos'),
});

export type SendOtpDto = z.infer<typeof sendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
