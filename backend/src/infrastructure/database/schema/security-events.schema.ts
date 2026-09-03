import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const securityEventsTable = pgTable('security_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  severity: varchar('severity', { length: 50 }).default('info').notNull(),
  ip: varchar('ip', { length: 45 }),
  deviceId: varchar('device_id', { length: 255 }),
  detailsJson: text('details_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SecurityEventDb = typeof securityEventsTable.$inferSelect;
export type NewSecurityEventDb = typeof securityEventsTable.$inferInsert;
