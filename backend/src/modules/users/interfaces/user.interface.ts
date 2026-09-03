import { UserStatus, UserType } from '../enums';

export interface UserAddressProps {
  id?: string;
  type: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfileProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  birthDate?: string | null;
  language: string;
  currency: string;
  completionPct?: number;
}

export interface BusinessProfileProps {
  legalName: string;
  tradeName?: string | null;
  taxId: string;
  legalType?: string | null;
  billingEmail?: string | null;
  fiscalAddress?: string | null;
  reviewStatus?: string;
}

export interface OnboardingStateProps {
  stepCode: string;
  status: string;
  completedAt?: Date | null;
}

export interface UserProps {
  id: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  type: UserType;
  status: UserStatus;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  profile?: UserProfileProps;
  businessProfile?: BusinessProfileProps | null;
  roles?: string[];
  permissions?: string[];
  addresses?: UserAddressProps[];
  onboardingStates?: OnboardingStateProps[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
