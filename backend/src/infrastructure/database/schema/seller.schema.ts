import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  numeric,
  uuid,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const sellerProfilesTable = pgTable(
  'seller_profiles',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .unique(),
    storeName: varchar('store_name', { length: 150 }).notNull(),
    storeSlug: varchar('store_slug', { length: 180 }).notNull().unique(),
    description: text('description'),
    logoUrl: text('logo_url'),
    bannerUrl: text('banner_url'),
    taxId: varchar('tax_id', { length: 60 }),
    rating: numeric('rating', { precision: 3, scale: 2 }).default('5.00').notNull(),
    totalSales: numeric('total_sales', { precision: 12, scale: 2 }).default('0').notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    status: varchar('status', { length: 30 }).default('active').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('seller_profiles_user_id_idx').on(table.userId),
    index('seller_profiles_slug_idx').on(table.storeSlug),
  ],
);

export type SellerProfileDb = typeof sellerProfilesTable.$inferSelect;
export type NewSellerProfileDb = typeof sellerProfilesTable.$inferInsert;
