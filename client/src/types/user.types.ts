import type { Paginated } from "./pagination.types";

export type UserRole =
  | "BUYER"
  | "SELLER"
  | "SELLER_INDIVIDUAL"
  | "SELLER_COMPANY"
  | "SELLER_EMPRESA"
  | "ADMIN"
  | "SUPERADMIN"
  | "SUPPORT"
  | "FINANCE"
  | "buyer"
  | "seller"
  | "seller_individual"
  | "seller_company"
  | "seller_empresa"
  | "admin"
  | "superadmin"
  | "support"
  | "finance";

export type UserStatus =
  | "PENDING"
  | "ACTIVE"
  | "RESTRICTED"
  | "SUSPENDED"
  | "IN_REVIEW"
  | "REJECTED"
  | "LOGICALLY_DELETED"
  | "BANNED"
  | "pending"
  | "active"
  | "restricted"
  | "suspended"
  | "in_review"
  | "rejected"
  | "logically_deleted"
  | "activa"
  | "pendiente"
  | "restringida"
  | "suspendida"
  | "en_revision"
  | "rechazada"
  | "eliminada_logicamente";

export type KycLevel = 0 | 1 | 2 | 3;

export interface UserProfile {
  firstName: string;
  lastName: string;
  language?: string;
  currency?: string;
  avatarUrl?: string | null;
  birthDate?: string | null;
  completionPct?: number;
}

export interface BusinessProfile {
  legalName?: string;
  tradeName?: string | null;
  taxId?: string;
  legalType?: string | null;
  reviewStatus?: string;
  billingEmail?: string | null;
  fiscalAddress?: string | null;
}

export interface OnboardingState {
  stepCode: string;
  status: string;
  completedAt?: string | null;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  roles?: string[];
  type?: string;
  status: UserStatus;
  kycLevel: KycLevel;
  emailVerified: boolean;
  phoneVerified?: boolean;
  completionPct?: number;
  profile?: UserProfile | null;
  businessProfile?: BusinessProfile | null;
  onboardingStates?: OnboardingState[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "ALL";
  status?: UserStatus | "ALL";
}

export type PaginatedUsers = Paginated<User>;

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  status?: UserStatus;
  kycLevel?: KycLevel;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  role?: UserRole;
  status?: UserStatus;
  kycLevel?: KycLevel;
  emailVerified?: boolean;
  password?: string;
}
