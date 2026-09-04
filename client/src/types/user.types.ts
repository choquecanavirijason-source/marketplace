import type { Paginated } from "./pagination.types";

export type UserRole =
  | "BUYER"
  | "SELLER"
  | "SELLER_INDIVIDUAL"
  | "SELLER_COMPANY"
  | "ADMIN"
  | "SUPERADMIN"
  | "SUPPORT"
  | "FINANCE"
  | "buyer"
  | "seller"
  | "seller_individual"
  | "seller_company"
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
  | "logically_deleted";

export type KycLevel = 0 | 1 | 2 | 3;

export interface UserProfile {
  firstName: string;
  lastName: string;
  language?: string;
  currency?: string;
  avatarUrl?: string | null;
  birthDate?: string | null;
  country?: string | null;
  phoneCountry?: string | null;
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
  avatarUrl?: string | null;
  role: UserRole;
  roles?: string[];
  type?: string;
  status: UserStatus;
  country?: string | null;
  phoneCountry?: string | null;
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
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
  phoneVerified?: boolean;
  password?: string;
}
