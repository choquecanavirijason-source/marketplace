import {
  pgTable,
  serial,
  integer,
  uuid,
  varchar,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { productsTable } from './catalog.schema';

export const cartsTable = pgTable(
  'carts',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
    guestToken: varchar('guest_token', { length: 120 }),
    status: varchar('status', { length: 30 }).default('active').notNull(),
    currency: varchar('currency', { length: 10 }).default('ARS').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('carts_user_id_idx').on(table.userId),
    index('carts_guest_token_idx').on(table.guestToken),
  ],
);

export const cartItemsTable = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    cartId: integer('cart_id')
      .notNull()
      .references(() => cartsTable.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(1).notNull(),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('cart_items_cart_id_idx').on(table.cartId),
    index('cart_items_product_id_idx').on(table.productId),
  ],
);
