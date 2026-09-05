import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  uuid,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const assetsTable = pgTable(
  'storage_assets',
  {
    id: serial('id').primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    url: text('url').notNull(),
    storageKey: varchar('storage_key', { length: 350 }).notNull().unique(),
    bucket: varchar('bucket', { length: 100 }).default('ferromax-media').notNull(),
    visibility: varchar('visibility', { length: 30 }).default('public').notNull(), // public, private
    status: varchar('status', { length: 30 }).default('active').notNull(), // pending, active, quarantined
    uploadedByUserId: uuid('uploaded_by_user_id').references(() => usersTable.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('storage_assets_status_idx').on(table.status),
    index('storage_assets_key_idx').on(table.storageKey),
  ],
);

export type AssetDb = typeof assetsTable.$inferSelect;
