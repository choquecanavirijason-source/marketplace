import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

/**
 * Tabla `security_events` según marketplace.md (Módulo 1, Sección 9)
 * Campos: id, user_id, event_type, severity, ip, device_id, details_json, created_at
 */
export const securityEventsTable = pgTable('security_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  severity: varchar('severity', { length: 50 }).default('info').notNull(), // 'info', 'warning', 'critical'
  ip: varchar('ip', { length: 45 }),
  deviceId: varchar('device_id', { length: 255 }),
  detailsJson: text('details_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SecurityEventDb = typeof securityEventsTable.$inferSelect;
export type NewSecurityEventDb = typeof securityEventsTable.$inferInsert;
