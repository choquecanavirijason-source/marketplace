import { Injectable } from '@nestjs/common';
import { eq, and, isNull, gt, desc } from 'drizzle-orm';
import { AuthRepositoryPort, SecurityEventRecord } from '../../domain/ports/auth-repository.port';
import { SessionEntity } from '../../domain/entities/session.entity';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  sessionsTable,
  SessionDb,
  verificationTokensTable,
  securityEventsTable,
} from '../../../../infrastructure/database/schema';

@Injectable()
export class SessionRepository implements AuthRepositoryPort {
  constructor(private readonly drizzle: DrizzleService) {}

  private toDomain(row: SessionDb): SessionEntity {
    return new SessionEntity({
      id: row.id,
      userId: row.userId,
      refreshTokenHash: row.refreshTokenHash,
      deviceId: row.deviceId,
      ip: row.ip,
      userAgent: row.userAgent,
      lastSeenAt: row.lastSeenAt,
      revokedAt: row.revokedAt,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    });
  }

  async createSession(session: SessionEntity): Promise<SessionEntity> {
    const rows = await this.drizzle.db
      .insert(sessionsTable)
      .values({
        id: session.id,
        userId: session.userId,
        refreshTokenHash: session.refreshTokenHash,
        deviceId: session.deviceId,
        ip: session.ip,
        userAgent: session.userAgent,
        lastSeenAt: session.lastSeenAt,
        revokedAt: session.revokedAt,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      })
      .returning();

    return this.toDomain(rows[0]);
  }

  async findSessionByTokenHash(tokenHash: string): Promise<SessionEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.refreshTokenHash, tokenHash))
      .limit(1);

    return rows.length > 0 ? this.toDomain(rows[0]) : null;
  }

  async findSessionById(id: string): Promise<SessionEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .limit(1);

    return rows.length > 0 ? this.toDomain(rows[0]) : null;
  }

  async findUserSessions(userId: string): Promise<SessionEntity[]> {
    const rows = await this.drizzle.db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.userId, userId),
          isNull(sessionsTable.revokedAt),
          gt(sessionsTable.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(sessionsTable.lastSeenAt));

    return rows.map((r) => this.toDomain(r));
  }

  async revokeSession(id: string): Promise<void> {
    await this.drizzle.db
      .update(sessionsTable)
      .set({ revokedAt: new Date() })
      .where(eq(sessionsTable.id, id));
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.drizzle.db
      .update(sessionsTable)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessionsTable.userId, userId), isNull(sessionsTable.revokedAt)));
  }

  async updateSessionLastSeen(id: string): Promise<void> {
    await this.drizzle.db
      .update(sessionsTable)
      .set({ lastSeenAt: new Date() })
      .where(eq(sessionsTable.id, id));
  }

  // --- Tokens de Verificación (Email, OTP, Password Reset) ---
  async createVerificationToken(
    userId: string,
    type: string,
    tokenHash: string,
    expiresAt: Date,
    metadata?: string,
  ): Promise<void> {
    // Invalida tokens previos no consumidos del mismo tipo para este usuario
    await this.drizzle.db
      .update(verificationTokensTable)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(verificationTokensTable.userId, userId),
          eq(verificationTokensTable.type, type),
          isNull(verificationTokensTable.consumedAt),
        ),
      );

    await this.drizzle.db.insert(verificationTokensTable).values({
      userId,
      type,
      tokenHash,
      expiresAt,
      metadata,
      createdAt: new Date(),
    });
  }

  async findValidVerificationToken(
    userId: string,
    type: string,
    tokenHash: string,
  ): Promise<{ id: string; metadata?: string | null } | null> {
    const rows = await this.drizzle.db
      .select()
      .from(verificationTokensTable)
      .where(
        and(
          eq(verificationTokensTable.userId, userId),
          eq(verificationTokensTable.type, type),
          eq(verificationTokensTable.tokenHash, tokenHash),
          isNull(verificationTokensTable.consumedAt),
          gt(verificationTokensTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    return { id: rows[0].id, metadata: rows[0].metadata };
  }

  async consumeVerificationToken(id: string): Promise<void> {
    await this.drizzle.db
      .update(verificationTokensTable)
      .set({ consumedAt: new Date() })
      .where(eq(verificationTokensTable.id, id));
  }

  // --- Bitácora de Seguridad y Auditoría Forense ---
  async logSecurityEvent(
    userId: string | null,
    eventType: string,
    severity: string = 'info',
    ip?: string,
    deviceId?: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.drizzle.db.insert(securityEventsTable).values({
        userId,
        eventType,
        severity,
        ip,
        deviceId,
        detailsJson: details ? JSON.stringify(details) : null,
        createdAt: new Date(),
      });
    } catch {
      // Don't interrupt flow if logging fails
    }
  }

  async getUserSecurityEvents(userId: string, limit = 50): Promise<SecurityEventRecord[]> {
    const rows = await this.drizzle.db
      .select()
      .from(securityEventsTable)
      .where(eq(securityEventsTable.userId, userId))
      .orderBy(desc(securityEventsTable.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      eventType: r.eventType,
      severity: r.severity,
      ip: r.ip,
      deviceId: r.deviceId,
      detailsJson: r.detailsJson,
      createdAt: r.createdAt,
    }));
  }
}
