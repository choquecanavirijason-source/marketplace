import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatarUrl: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  language: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  country: z.string().max(100).optional().nullable(),
  phoneCountry: z.string().max(10).optional().nullable(),
  phone: z.string().min(6).optional().nullable(),
  name: z.string().optional(),
  mobileNumber: z.string().optional().nullable(),
  mobile_number: z.string().optional().nullable(),
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

export type ProfileDto = UpdateProfileDto;
export type BusinessProfileDto = UpdateBusinessProfileDto;
export const profileSchema = updateProfileSchema;
export const businessProfileSchema = updateBusinessProfileSchema;
