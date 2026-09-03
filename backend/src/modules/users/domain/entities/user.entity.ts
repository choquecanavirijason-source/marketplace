import { UserRole, UserType, UserStatus, KycLevel, DomainException, getPermissionsForRole } from '../../../../shared';

export interface UserProfileProps {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  birthDate?: Date | string | null;
  language?: string;
  currency?: string;
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
      roles: props.roles && props.roles.length > 0 ? props.roles : [userType],
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
  get completionPct(): number { return this.props.profile?.completionPct ?? 0; }
  get emailVerified(): boolean { return Boolean(this.props.emailVerifiedAt); }

  verifyEmail() {
    const now = new Date();
    this.props.emailVerifiedAt = now;
    this.props.updatedAt = now;
  }

  verifyPhone() {
    const now = new Date();
    this.props.phoneVerifiedAt = now;
    this.props.updatedAt = now;
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
    if (this.props.phoneVerifiedAt) score += 20;
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
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      avatarUrl: this.avatarUrl,
      birthDate: this.birthDate,
      language: this.language,
      currency: this.currency,
      completionPct: this.completionPct,
      profile: this.profile,
      businessProfile: this.businessProfile,
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
