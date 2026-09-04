import { z } from 'zod';

export const updateAuthSettingsSchema = z.object({
  emailPasswordEnabled: z.boolean().optional(),
  phoneOtpEnabled: z.boolean().optional(),
  socialLoginEnabled: z.boolean().optional(),
  googleAuthEnabled: z.boolean().optional(),
  googleClientId: z.string().nullable().optional(),
  facebookAuthEnabled: z.boolean().optional(),
  facebookClientId: z.string().nullable().optional(),
  appleAuthEnabled: z.boolean().optional(),
  appleClientId: z.string().nullable().optional(),
  defaultAuthMethod: z.enum(['email', 'phone', 'social']).optional(),
  requireEmailVerification: z.boolean().optional(),
  requirePhoneVerification: z.boolean().optional(),
});

export type UpdateAuthSettingsDto = z.infer<typeof updateAuthSettingsSchema>;

export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']),
  token: z.string().optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export type SocialLoginDto = z.infer<typeof socialLoginSchema>;

export const phoneOtpLoginSchema = z.object({
  phone: z.string().min(6, 'Número de teléfono inválido'),
  code: z.string().min(4, 'Código OTP inválido'),
});

export type PhoneOtpLoginDto = z.infer<typeof phoneOtpLoginSchema>;
