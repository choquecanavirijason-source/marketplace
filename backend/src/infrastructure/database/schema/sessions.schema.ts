import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

/**
 * Tabla `sessions` según marketplace.md (Módulo 1, Sección 9)
 * Campos: id, user_id, refresh_token_hash, device_id, ip, user_agent, last_seen_at, revoked_at, expires_at, created_at
 */
export const sessionsTable = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  deviceId: varchar('device_id', { length: 255 }),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SessionDb = typeof sessionsTable.$inferSelect;
export type NewSessionDb = typeof sessionsTable.$inferInsert;
