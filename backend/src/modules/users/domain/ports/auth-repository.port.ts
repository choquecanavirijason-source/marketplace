import { SessionEntity } from '../entities/session.entity';

export interface SecurityEventRecord {
  id: string;
  userId: string | null;
  eventType: string;
  severity: string;
  ip?: string | null;
  deviceId?: string | null;
  detailsJson?: string | null;
  createdAt: Date;
}

export abstract class AuthRepositoryPort {
  abstract createSession(session: SessionEntity): Promise<SessionEntity>;
  abstract findSessionByTokenHash(tokenHash: string): Promise<SessionEntity | null>;
  abstract findSessionById(id: string): Promise<SessionEntity | null>;
  abstract findUserSessions(userId: string): Promise<SessionEntity[]>;
  abstract revokeSession(id: string): Promise<void>;
  abstract revokeAllUserSessions(userId: string): Promise<void>;
  abstract updateSessionLastSeen(id: string): Promise<void>;

  // Tokens de verificación uniuso (email, teléfono OTP, forgot-password)
  abstract createVerificationToken(
    userId: string,
    type: string,
    tokenHash: string,
    expiresAt: Date,
    metadata?: string,
  ): Promise<void>;
  abstract findValidVerificationToken(
    userId: string,
    type: string,
    tokenHash: string,
  ): Promise<{ id: string; metadata?: string | null } | null>;
  abstract consumeVerificationToken(id: string): Promise<void>;

  // Bitácora de seguridad y auditoría
  abstract logSecurityEvent(
    userId: string | null,
    eventType: string,
    severity?: string,
    ip?: string,
    deviceId?: string,
    details?: Record<string, unknown>,
  ): Promise<void>;
  abstract getUserSecurityEvents(userId: string, limit?: number): Promise<SecurityEventRecord[]>;
}
