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
import { ordersTable } from './orders.schema';

export const paymentsTable = pgTable(
  'payments',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('ARS').notNull(),
    status: varchar('status', { length: 40 }).default('pending').notNull(),
    provider: varchar('provider', { length: 50 }).default('simulator').notNull(),
    providerPaymentId: varchar('provider_payment_id', { length: 150 }),
    paymentMethod: varchar('payment_method', { length: 50 }).default('card').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
  },
  (table) => [
    index('payments_order_id_idx').on(table.orderId),
    index('payments_status_idx').on(table.status),
    index('payments_provider_id_idx').on(table.providerPaymentId),
  ],
);

export const financialLedgerTable = pgTable(
  'financial_ledger_entries',
  {
    id: serial('id').primaryKey(),
    paymentId: integer('payment_id').references(() => paymentsTable.id, { onDelete: 'set null' }),
    orderId: integer('order_id').references(() => ordersTable.id, { onDelete: 'set null' }),
    type: varchar('type', { length: 50 }).notNull(), // credit, debit, escrow_hold, escrow_release, fee, refund
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    balanceAfter: numeric('balance_after', { precision: 14, scale: 2 }).notNull(),
    description: text('description').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('ledger_payment_id_idx').on(table.paymentId),
    index('ledger_order_id_idx').on(table.orderId),
    index('ledger_created_at_idx').on(table.createdAt),
  ],
);

export const escrowHoldsTable = pgTable(
  'escrow_holds',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    paymentId: integer('payment_id')
      .notNull()
      .references(() => paymentsTable.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    status: varchar('status', { length: 30 }).default('held').notNull(), // held, released, refunded
    autoReleaseAt: timestamp('auto_release_at', { withTimezone: true }),
    releasedAt: timestamp('released_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('escrow_order_id_idx').on(table.orderId),
    index('escrow_status_idx').on(table.status),
  ],
);
