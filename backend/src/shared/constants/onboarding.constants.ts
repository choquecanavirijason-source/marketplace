/**
 * Pasos y estados de Onboarding según marketplace.md (Módulo 1, Sección 4.6 y 9)
 */
export enum OnboardingStep {
  REGISTRO_BASE = 'registro_base',
  EMAIL_VERIFICADO = 'email_verificado',
  TELEFONO_VERIFICADO = 'telefono_verificado',
  PERFIL_COMPLETO = 'perfil_completo',
  TERMINOS_ACEPTADOS = 'terminos_aceptados',
  KYC_PENDIENTE = 'kyc_pendiente',
  KYC_APROBADO = 'kyc_aprobado',
  KYC_RECHAZADO = 'kyc_rechazado',
}

export enum OnboardingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}
