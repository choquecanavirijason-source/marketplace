import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  uuid,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { productsTable } from './catalog.schema';

export const liveEventsTable = pgTable(
  'live_events',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 250 }).notNull(),
    slug: varchar('slug', { length: 280 }).notNull().unique(),
    description: text('description'),
    sellerId: uuid('seller_id').references(() => usersTable.id, { onDelete: 'set null' }),
    streamUrl: text('stream_url'),
    status: varchar('status', { length: 30 }).default('scheduled').notNull(), // scheduled, live, ended, cancelled
    viewerCount: integer('viewer_count').default(0).notNull(),
    pinnedProductId: integer('pinned_product_id').references(() => productsTable.id, { onDelete: 'set null' }),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('live_events_status_idx').on(table.status),
    index('live_events_slug_idx').on(table.slug),
  ],
);

export const liveChatMessagesTable = pgTable(
  'live_chat_messages',
  {
    id: serial('id').primaryKey(),
    liveEventId: integer('live_event_id')
      .notNull()
      .references(() => liveEventsTable.id, { onDelete: 'cascade' }),
    userName: varchar('user_name', { length: 120 }).notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('live_chat_event_id_idx').on(table.liveEventId)],
);

export type LiveEventDb = typeof liveEventsTable.$inferSelect;
