export interface SessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;
  clientIp?: string | null;
  userAgent?: string | null;
  isRevoked: boolean;
  expiresAt: Date;
  lastUsedAt?: Date | null;
  createdAt: Date;
}
