export enum OnboardingStep {
  BASE_REGISTRATION = 'base_registration',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  PROFILE_COMPLETED = 'profile_completed',
  TERMS_ACCEPTED = 'terms_accepted',
  KYC_PENDING = 'kyc_pending',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
}

export enum OnboardingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}
