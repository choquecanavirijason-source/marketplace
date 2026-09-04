export const OnboardingStep = {
  BASE_REGISTRATION: 'base_registration',
  PROFILE_COMPLETED: 'profile_completed',
  TERMS_ACCEPTED: 'terms_accepted',
  EMAIL_VERIFIED: 'email_verified',
  PHONE_VERIFIED: 'phone_verified',
  KYC_SUBMITTED: 'kyc_submitted',
  KYC_APPROVED: 'kyc_approved',
  SELLER_STORE_SETUP: 'seller_store_setup',
  SELLER_BANK_ACCOUNT: 'seller_bank_account',
} as const;

export type OnboardingStep = (typeof OnboardingStep)[keyof typeof OnboardingStep];
