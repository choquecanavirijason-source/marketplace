import {
  pgTable,
  serial,
  integer,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { productsTable } from './catalog.schema';

export const ordersTable = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    buyerId: uuid('buyer_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict' }),
    status: varchar('status', { length: 40 }).default('pendiente').notNull(),
    paymentStatus: varchar('payment_status', { length: 40 }).default('pending').notNull(),
    currency: varchar('currency', { length: 10 }).default('ARS').notNull(),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
    shippingCost: numeric('shipping_cost', { precision: 12, scale: 2 }).notNull().default('0'),
    discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
    total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),

    shippingName: varchar('shipping_name', { length: 200 }),
    shippingPhone: varchar('shipping_phone', { length: 50 }),
    shippingAddress: varchar('shipping_address', { length: 300 }),
    shippingCity: varchar('shipping_city', { length: 120 }),
    shippingProvince: varchar('shipping_province', { length: 120 }),
    shippingZip: varchar('shipping_zip', { length: 30 }),
    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('orders_buyer_id_idx').on(table.buyerId),
    index('orders_order_number_idx').on(table.orderNumber),
    index('orders_status_idx').on(table.status),
    index('orders_created_at_idx').on(table.createdAt),
  ],
);

export const orderItemsTable = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'restrict' }),
    sellerId: uuid('seller_id').references(() => usersTable.id, { onDelete: 'set null' }),
    productName: varchar('product_name', { length: 255 }).notNull(),
    productImage: text('product_image'),
    unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
    quantity: integer('quantity').default(1).notNull(),
    subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('order_items_order_id_idx').on(table.orderId),
    index('order_items_product_id_idx').on(table.productId),
    index('order_items_seller_id_idx').on(table.sellerId),
  ],
);

export const orderTimelineEventsTable = pgTable(
  'order_timeline_events',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 80 }).notNull(),
    actorType: varchar('actor_type', { length: 50 }).notNull(), // buyer, seller, admin, system
    actorId: uuid('actor_id'),
    description: text('description').notNull(),
    metadata: text('metadata'), // JSON string

    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('order_timeline_events_order_id_idx').on(table.orderId),
    index('order_timeline_events_occurred_at_idx').on(table.occurredAt),
  ],
);
