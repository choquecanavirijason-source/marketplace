import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { ordersTable } from './orders.schema';

export const shipmentsTable = pgTable(
  'shipments',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    carrier: varchar('carrier', { length: 80 }).default('Correo Express').notNull(),
    trackingCode: varchar('tracking_code', { length: 120 }).notNull().unique(),
    status: varchar('status', { length: 40 }).default('pendiente_preparacion').notNull(),
    serviceType: varchar('service_type', { length: 60 }).default('estandar').notNull(),
    shippingCost: numeric('shipping_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    estimatedDeliveryAt: timestamp('estimated_delivery_at', { withTimezone: true }),
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    destinationAddress: text('destination_address').notNull(),
    destinationCity: varchar('destination_city', { length: 120 }).notNull(),
    receiverName: varchar('receiver_name', { length: 150 }).notNull(),
    receiverPhone: varchar('receiver_phone', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('shipments_order_id_idx').on(table.orderId),
    index('shipments_tracking_code_idx').on(table.trackingCode),
    index('shipments_status_idx').on(table.status),
  ],
);

export const shipmentEventsTable = pgTable(
  'shipment_events',
  {
    id: serial('id').primaryKey(),
    shipmentId: integer('shipment_id')
      .notNull()
      .references(() => shipmentsTable.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 40 }).notNull(),
    location: varchar('location', { length: 150 }).notNull(),
    description: text('description').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('shipment_events_shipment_id_idx').on(table.shipmentId)],
);

export type ShipmentDb = typeof shipmentsTable.$inferSelect;
export type NewShipmentDb = typeof shipmentsTable.$inferInsert;
