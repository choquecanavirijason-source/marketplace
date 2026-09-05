import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  uuid,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const conversationsTable = pgTable(
  'community_conversations',
  {
    id: serial('id').primaryKey(),
    channel: varchar('channel', { length: 50 }).default('webchat').notNull(), // webchat, whatsapp, email
    status: varchar('status', { length: 40 }).default('open').notNull(), // open, pending, resolved, closed
    customerId: uuid('customer_id').references(() => usersTable.id, { onDelete: 'set null' }),
    assignedAgentId: uuid('assigned_agent_id').references(() => usersTable.id, { onDelete: 'set null' }),
    subject: varchar('subject', { length: 250 }).notNull(),
    priority: varchar('priority', { length: 30 }).default('medium').notNull(), // low, medium, high, urgent
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('comm_conv_channel_idx').on(table.channel),
    index('comm_conv_status_idx').on(table.status),
  ],
);

export const conversationMessagesTable = pgTable(
  'community_messages',
  {
    id: serial('id').primaryKey(),
    conversationId: integer('conversation_id')
      .notNull()
      .references(() => conversationsTable.id, { onDelete: 'cascade' }),
    senderType: varchar('sender_type', { length: 30 }).notNull(), // customer, agent, bot
    senderId: uuid('sender_id').references(() => usersTable.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    isAiGenerated: boolean('is_ai_generated').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('comm_msg_conversation_id_idx').on(table.conversationId)],
);

export type ConversationDb = typeof conversationsTable.$inferSelect;
export type MessageDb = typeof conversationMessagesTable.$inferSelect;
