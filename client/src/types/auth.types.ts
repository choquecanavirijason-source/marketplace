export type {
  CurrentUser,
  Customer,
} from "@/shared/lib/marketplaceStorage";

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  mobileNumber?: string | null;
  address?: string | null;
  role?: string | null;
  roleName: string | null;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  type?: string | null;
  status?: string | null;
  roles?: string[];
  country?: string | null;
  phoneCountry?: string | null;
  completionPct?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  businessProfile?: {
    legalName?: string;
    tradeName?: string;
    taxId?: string;
    legalType?: string;
    reviewStatus?: string;
    billingEmail?: string;
    fiscalAddress?: string;
  } | null;
  onboardingStates?: Array<{
    stepCode: string;
    status: string;
  }> | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string | null;
  user: AuthUser;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OtpLoginCredentials {
  phone?: string;
  email?: string;
  code: string;
}

export interface RegisterData {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  mobileNumber?: string;
  address?: string;
  type?: "buyer" | "seller_individual" | "seller_company";
  legalName?: string;
  tradeName?: string;
  taxId?: string;
  legalType?: string;
  fiscalAddress?: string;
  country?: string;
  phoneCountry?: string;
  termsAccepted?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobileNumber?: string;
  birthDate?: string;
  address?: string;
  password?: string;
  language?: string;
  currency?: string;
  country?: string | null;
  phoneCountry?: string | null;
  avatarUrl?: string;
}

export interface UpdateBusinessProfileData {
  legalName?: string;
  tradeName?: string;
  taxId?: string;
  legalType?: string;
  billingEmail?: string;
  fiscalAddress?: string;
}

export interface UserSessionItem {
  id: string;
  deviceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  lastSeenAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export interface UserAuditEvent {
  id: string;
  eventType: string;
  severity: "info" | "warning" | "critical";
  ip?: string | null;
  deviceId?: string | null;
  userAgent?: string | null;
  detailsJson?: string | Record<string, any> | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface BusinessProfileData {
  legalName?: string;
  tradeName?: string;
  taxId?: string;
  legalType?: string;
  billingEmail?: string;
  fiscalAddress?: string;
  reviewStatus?: string;
}

export interface UserAddress {
  id: string;
  label: string;
  country: string;
  province: string;
  city: string;
  street: string;
  number: string;
  zip: string;
  isDefault: boolean;
}

export interface AddressInput {
  label: string;
  country: string;
  province: string;
  city: string;
  street: string;
  number: string;
  zip: string;
  isDefault?: boolean;
}

export interface AuthenticatedUserProfile {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  type: string;
  roles: string[];
  permissions: string[];
  completionPct?: number;
  businessProfile?: BusinessProfileData | null;
  addresses?: UserAddress[];
}

export interface PublicAuthSettings {
  emailPasswordEnabled: boolean;
  phoneOtpEnabled: boolean;
  socialLoginEnabled: boolean;
  googleAuthEnabled: boolean;
  facebookAuthEnabled: boolean;
  appleAuthEnabled: boolean;
  defaultAuthMethod: "email" | "phone" | "social";
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
}

export interface AdminAuthSettings extends PublicAuthSettings {
  id: string;
  googleClientId?: string | null;
  facebookClientId?: string | null;
  appleClientId?: string | null;
  updatedAt?: string;
}

export interface UpdateAuthSettingsData {
  emailPasswordEnabled?: boolean;
  phoneOtpEnabled?: boolean;
  socialLoginEnabled?: boolean;
  googleAuthEnabled?: boolean;
  googleClientId?: string | null;
  facebookAuthEnabled?: boolean;
  facebookClientId?: string | null;
  appleAuthEnabled?: boolean;
  appleClientId?: string | null;
  defaultAuthMethod?: "email" | "phone" | "social";
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
}
