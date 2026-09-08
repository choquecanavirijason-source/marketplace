import { UserRole, UserType, UserStatus, getPermissionsForRole } from '../../../../shared';

export interface UserProfileProps {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  birthDate?: Date | string | null;
  language?: string;
  currency?: string;
  country?: string | null;
  phoneCountry?: string | null;
  completionPct?: number;
}

export interface BusinessProfileProps {
  id?: string;
  userId?: string;
  legalName: string;
  tradeName?: string | null;
  taxId: string;
  legalType?: string | null;
  billingEmail?: string | null;
  fiscalAddress?: string | null;
  reviewStatus?: string;
}

export interface SellerProfileProps {
  id?: number;
  userId?: string;
  storeName: string;
  storeSlug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  taxId?: string | null;
  rating?: string | number;
  totalSales?: string | number;
  isVerified?: boolean;
  status?: string;
}

export interface AddressProps {
  id?: string;
  userId?: string;
  label?: string;
  country: string;
  province: string;
  city: string;
  street: string;
  number: string;
  zip: string;
  isDefault?: boolean;
}

export interface OnboardingStateProps {
  id?: string;
  userId?: string;
  stepCode: string;
  status: string;
  completedAt?: Date | null;
}

export interface UserProps {
  id: string;
  status: UserStatus;
  type?: UserType;
  role?: UserRole;
  email: string;
  phone?: string | null;
  passwordHash: string;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  profile?: UserProfileProps | null;
  businessProfile?: BusinessProfileProps | null;
  sellerProfile?: SellerProfileProps | null;
  roles?: string[];
  permissions?: string[];
  addresses?: AddressProps[];
  onboardingStates?: OnboardingStateProps[];
}

export class UserEntity {
  private props: UserProps;

  constructor(props: UserProps) {
    const userType = props.type ?? props.role ?? UserType.BUYER;
    this.props = {
      ...props,
      type: userType,
      role: userType,
      roles:
        props.roles && props.roles.length > 0
          ? props.roles
          : (userType === 'seller_company'
              ? ['seller_company', 'seller']
              : [userType]),
      permissions: props.permissions ?? getPermissionsForRole(userType),
      addresses: props.addresses ?? [],
      onboardingStates: props.onboardingStates ?? [],
      profile: props.profile
        ? {
            ...props.profile,
            completionPct: props.profile.completionPct !== undefined ? props.profile.completionPct : 20,
          }
        : {
            firstName: '',
            lastName: '',
            language: 'es',
            currency: 'USD',
            completionPct: 20,
          },
    };
    this.calculateCompletionPct();
  }

  get id(): string { return this.props.id; }
  get status(): UserStatus { return this.props.status; }
  get type(): UserType { return this.props.type ?? UserType.BUYER; }
  get role(): UserRole { return this.props.type ?? UserType.BUYER; }
  get email(): string { return this.props.email; }
  get phone(): string | null | undefined { return this.props.phone; }
  get passwordHash(): string { return this.props.passwordHash; }
  get emailVerifiedAt(): Date | null | undefined { return this.props.emailVerifiedAt; }
  get phoneVerifiedAt(): Date | null | undefined { return this.props.phoneVerifiedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get deletedAt(): Date | null | undefined { return this.props.deletedAt; }

  get profile(): UserProfileProps | undefined | null { return this.props.profile; }
  get businessProfile(): BusinessProfileProps | undefined | null { return this.props.businessProfile; }
  get sellerProfile(): SellerProfileProps | undefined | null { return this.props.sellerProfile; }
  get roles(): string[] { return this.props.roles ?? [this.type]; }
  get permissions(): string[] { return this.props.permissions ?? []; }
  get addresses(): AddressProps[] { return this.props.addresses ?? []; }
  get onboardingStates(): OnboardingStateProps[] { return this.props.onboardingStates ?? []; }

  get firstName(): string { return this.props.profile?.firstName || ''; }
  get lastName(): string { return this.props.profile?.lastName || ''; }
  get fullName(): string {
    const full = `${this.firstName} ${this.lastName}`.trim();
    return full || this.props.email;
  }
  get avatarUrl(): string | null | undefined { return this.props.profile?.avatarUrl; }
  get birthDate(): Date | string | null | undefined { return this.props.profile?.birthDate; }
  get language(): string { return this.props.profile?.language ?? 'es'; }
  get currency(): string { return this.props.profile?.currency ?? 'USD'; }
  get country(): string | null | undefined { return this.props.profile?.country; }
  get phoneCountry(): string | null | undefined { return this.props.profile?.phoneCountry; }
  get completionPct(): number { return this.props.profile?.completionPct ?? 20; }
  get emailVerified(): boolean { return Boolean(this.props.emailVerifiedAt); }
  get phoneVerified(): boolean { return Boolean(this.props.phoneVerifiedAt); }

  verifyEmail() {
    const now = new Date();
    this.props.emailVerifiedAt = now;
    this.props.updatedAt = now;
    this.calculateCompletionPct();
  }

  unverifyEmail() {
    this.props.emailVerifiedAt = null;
    this.props.updatedAt = new Date();
    this.calculateCompletionPct();
  }

  verifyPhone() {
    const now = new Date();
    this.props.phoneVerifiedAt = now;
    this.props.updatedAt = now;
    this.calculateCompletionPct();
  }

  unverifyPhone() {
    this.props.phoneVerifiedAt = null;
    this.props.updatedAt = new Date();
    this.calculateCompletionPct();
  }

  updateProfile(profileData: Partial<UserProfileProps>) {
    this.props.profile = {
      ...this.props.profile,
      ...profileData,
      firstName: profileData.firstName ?? this.props.profile?.firstName ?? '',
      lastName: profileData.lastName ?? this.props.profile?.lastName ?? '',
    };
    this.calculateCompletionPct();
    this.props.updatedAt = new Date();
  }

  updateBusinessProfile(businessData: Partial<BusinessProfileProps>) {
    this.props.businessProfile = {
      ...this.props.businessProfile,
      ...businessData,
      legalName: businessData.legalName ?? this.props.businessProfile?.legalName ?? '',
      taxId: businessData.taxId ?? this.props.businessProfile?.taxId ?? '',
    };
    this.props.updatedAt = new Date();
  }

  updateSellerProfile(sellerData: Partial<SellerProfileProps>) {
    this.props.sellerProfile = {
      ...this.props.sellerProfile,
      ...sellerData,
      storeName: sellerData.storeName ?? this.props.sellerProfile?.storeName ?? '',
      storeSlug: sellerData.storeSlug ?? this.props.sellerProfile?.storeSlug ?? '',
    };
    this.props.updatedAt = new Date();
  }

  setRoles(roles: string[]) {
    this.props.roles = roles;
    this.props.updatedAt = new Date();
  }

  setPermissions(permissions: string[]) {
    this.props.permissions = permissions;
  }

  calculateCompletionPct(): number {
    let score = 20;
    if (this.props.emailVerifiedAt) score += 20;
    if (this.props.phoneVerifiedAt) {
      score += 20;
    } else if (this.props.phone && this.props.phone.trim().length >= 6) {
      score += 10;
    }
    if (this.props.profile?.firstName && this.props.profile?.lastName) score += 20;
    if (this.props.profile?.avatarUrl) score += 10;
    if (this.props.profile?.birthDate) score += 10;
    if (score > 100) score = 100;

    if (this.props.profile) {
      this.props.profile.completionPct = score;
    }
    return score;
  }

  activate() {
    this.props.status = UserStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  suspend() {
    this.props.status = UserStatus.SUSPENDED;
    this.props.updatedAt = new Date();
  }

  restrict() {
    this.props.status = UserStatus.RESTRICTED;
    this.props.updatedAt = new Date();
  }

  sendToReview() {
    this.props.status = UserStatus.IN_REVIEW;
    this.props.updatedAt = new Date();
  }

  reject() {
    this.props.status = UserStatus.REJECTED;
    this.props.updatedAt = new Date();
  }

  softDelete() {
    const now = new Date();
    this.props.status = UserStatus.LOGICALLY_DELETED;
    this.props.deletedAt = now;
    this.props.updatedAt = now;
  }


  changeStatus(status: UserStatus) {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  changePassword(newHash: string) {
    this.props.passwordHash = newHash;
    this.props.updatedAt = new Date();
  }

  changePhone(phone?: string | null) {
    this.props.phone = phone;
    this.props.updatedAt = new Date();
    this.calculateCompletionPct();
  }

  changeType(type: UserType) {
    this.props.type = type;
    this.props.role = type;
    this.props.updatedAt = new Date();
  }

  recordLogin() {
    this.props.updatedAt = new Date();
  }

  get kycLevel(): number {
    return 0;
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      type: this.type,
      role: this.role,
      email: this.email,
      phone: this.phone,
      emailVerifiedAt: this.emailVerifiedAt,
      phoneVerifiedAt: this.phoneVerifiedAt,
      emailVerified: this.emailVerified,
      phoneVerified: this.phoneVerified,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      avatarUrl: this.avatarUrl,
      birthDate: this.birthDate,
      language: this.language,
      currency: this.currency,
      country: this.country,
      phoneCountry: this.phoneCountry,
      completionPct: this.completionPct,
      profile: this.profile,
      businessProfile: this.businessProfile,
      sellerProfile: this.sellerProfile,
      roles: this.roles,
      permissions: this.permissions,
      addresses: this.addresses,
      onboardingStates: this.onboardingStates,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
