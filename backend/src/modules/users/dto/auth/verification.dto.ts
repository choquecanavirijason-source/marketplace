import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido.').toLowerCase().trim(),
});
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido.').toLowerCase().trim().optional(),
  token: z.string().min(1, 'El código o token de recuperación es requerido.'),
  password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
});
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido.').toLowerCase().trim(),
  token: z.string().min(1, 'El token es requerido.'),
});
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

export const sendPhoneOtpSchema = z.object({
  phone: z.string().min(6, 'Número de teléfono inválido.').trim(),
});
export type SendPhoneOtpDto = z.infer<typeof sendPhoneOtpSchema>;

export const verifyPhoneOtpSchema = z.object({
  phone: z.string().min(6, 'Número de teléfono inválido.').trim(),
  code: z.string().min(4, 'Código OTP requerido.').max(10),
});
export type VerifyPhoneOtpDto = z.infer<typeof verifyPhoneOtpSchema>;
