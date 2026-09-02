import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { KycStatus, DocumentType } from '../../../shared';

export const verificationsTable = pgTable('verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).default(KycStatus.DRAFT).notNull(),
  targetLevel: integer('target_level').default(1).notNull(),
  provider: varchar('provider', { length: 50 }).default('LOCAL_MOCK').notNull(),
  providerSessionId: varchar('provider_session_id', { length: 255 }),
  rejectionReason: text('rejection_reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const documentsTable = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  verificationId: uuid('verification_id')
    .notNull()
    .references(() => verificationsTable.id, { onDelete: 'cascade' }),
  documentType: varchar('document_type', { length: 50 }).default(DocumentType.NATIONAL_ID).notNull(),
  s3Key: text('s3_key').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type VerificationDb = typeof verificationsTable.$inferSelect;
export type NewVerificationDb = typeof verificationsTable.$inferInsert;
export type DocumentDb = typeof documentsTable.$inferSelect;
export type NewDocumentDb = typeof documentsTable.$inferInsert;
