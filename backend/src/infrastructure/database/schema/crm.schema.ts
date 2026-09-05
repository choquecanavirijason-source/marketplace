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

export const leadsTable = pgTable(
  'crm_leads',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    company: varchar('company', { length: 150 }),
    source: varchar('source', { length: 80 }).default('web').notNull(),
    status: varchar('status', { length: 40 }).default('nuevo').notNull(), // nuevo, contactado, calificado, descartado
    score: integer('score').default(10).notNull(),
    notes: text('notes'),
    assignedToUserId: uuid('assigned_to_user_id').references(() => usersTable.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('crm_leads_email_idx').on(table.email),
    index('crm_leads_status_idx').on(table.status),
  ],
);

export const opportunitiesTable = pgTable(
  'crm_opportunities',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    leadId: integer('lead_id').references(() => leadsTable.id, { onDelete: 'cascade' }),
    stage: varchar('stage', { length: 50 }).default('prospeccion').notNull(), // prospeccion, propuesta, negociacion, ganado, perdido
    expectedValue: numeric('expected_value', { precision: 12, scale: 2 }).default('0').notNull(),
    probabilityPct: integer('probability_pct').default(20).notNull(),
    closeDate: timestamp('close_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('crm_opps_stage_idx').on(table.stage)],
);

export type LeadDb = typeof leadsTable.$inferSelect;
export type OpportunityDb = typeof opportunitiesTable.$inferSelect;
