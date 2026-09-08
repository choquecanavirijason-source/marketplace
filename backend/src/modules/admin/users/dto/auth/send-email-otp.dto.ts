import { z } from 'zod';

export const sendEmailOtpSchema = z.object({
  email: z.string().email('El correo electrónico no tiene un formato válido.'),
});

export type SendEmailOtpDto = z.infer<typeof sendEmailOtpSchema>;
