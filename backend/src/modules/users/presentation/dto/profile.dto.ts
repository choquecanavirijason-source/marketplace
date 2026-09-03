import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
  birthDate: z.string().optional(),
  language: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  phone: z.string().min(6).optional(),
  name: z.string().optional(),
  mobileNumber: z.string().optional(),
  mobile_number: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const updateBusinessProfileSchema = z.object({
  legalName: z.string().min(2).optional(),
  tradeName: z.string().optional(),
  taxId: z.string().min(3).optional(),
  legalType: z.string().optional(),
  billingEmail: z.string().email().optional(),
  fiscalAddress: z.string().optional(),
});

export type UpdateBusinessProfileDto = z.infer<typeof updateBusinessProfileSchema>;
