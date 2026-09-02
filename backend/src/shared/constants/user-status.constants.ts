/**
 * Estados de Usuario según marketplace.md (Módulo 1, Sección 4.6)
 * pendiente, activa, restringida, suspendida, en_revision, rechazada, eliminada_logicamente
 */
export enum UserStatus {
  PENDIENTE = 'pendiente',
  ACTIVA = 'activa',
  RESTRINGIDA = 'restringida',
  SUSPENDIDA = 'suspendida',
  EN_REVISION = 'en_revision',
  RECHAZADA = 'rechazada',
  ELIMINADA_LOGICAMENTE = 'eliminada_logicamente',

  // Alias para retrocompatibilidad
  ACTIVE = 'activa',
  PENDING_VERIFICATION = 'pendiente',
  SUSPENDED = 'suspendida',
  BANNED = 'suspendida',
}
