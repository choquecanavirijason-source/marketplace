import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  unique,
} from 'drizzle-orm/pg-core';
import { UserType, UserStatus } from '../../../shared';

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  status: varchar('status', { length: 50 }).default(UserStatus.PENDING).notNull(),
  type: varchar('type', { length: 50 }).default(UserType.BUYER).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).unique(),
  passwordHash: text('password_hash').notNull(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  emailVerified: boolean('email_verified').default(false),
  phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const userProfilesTable = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  avatarUrl: text('avatar_url'),
  birthDate: date('birth_date'),
  language: varchar('language', { length: 10 }).default('es').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  completionPct: integer('completion_pct').default(0).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const businessProfilesTable = pgTable('business_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  tradeName: varchar('trade_name', { length: 255 }),
  taxId: varchar('tax_id', { length: 50 }).notNull(),
  legalType: varchar('legal_type', { length: 50 }),
  billingEmail: varchar('billing_email', { length: 255 }),
  fiscalAddress: text('fiscal_address'),
  reviewStatus: varchar('review_status', { length: 50 }).default('pending').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const rolesTable = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  codename: varchar('codename', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  isSystem: boolean('is_system').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const permissionsTable = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  resource: varchar('resource', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userRolesTable = pgTable('user_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id')
    .notNull()
    .references(() => rolesTable.id, { onDelete: 'cascade' }),
  assignedBy: uuid('assigned_by').references(() => usersTable.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
});

export const rolePermissionsTable = pgTable('role_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  roleId: uuid('role_id')
    .notNull()
    .references(() => rolesTable.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id')
    .notNull()
    .references(() => permissionsTable.id, { onDelete: 'cascade' }),
});

export const addressesTable = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }).default('Principal').notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  number: varchar('number', { length: 50 }).notNull(),
  zip: varchar('zip', { length: 20 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const verificationTokensTable = pgTable('verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  metadata: text('metadata'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const onboardingStatesTable = pgTable(
  'onboarding_states',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    stepCode: varchar('step_code', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('onboarding_user_step_unique').on(table.userId, table.stepCode),
  ],
);

export type UserDb = typeof usersTable.$inferSelect;
export type NewUserDb = typeof usersTable.$inferInsert;

export type UserProfileDb = typeof userProfilesTable.$inferSelect;
export type NewUserProfileDb = typeof userProfilesTable.$inferInsert;

export type BusinessProfileDb = typeof businessProfilesTable.$inferSelect;
export type NewBusinessProfileDb = typeof businessProfilesTable.$inferInsert;

export type RoleDb = typeof rolesTable.$inferSelect;
export type NewRoleDb = typeof rolesTable.$inferInsert;

export type PermissionDb = typeof permissionsTable.$inferSelect;
export type NewPermissionDb = typeof permissionsTable.$inferInsert;

export type UserRoleDb = typeof userRolesTable.$inferSelect;
export type NewUserRoleDb = typeof userRolesTable.$inferInsert;

export type RolePermissionDb = typeof rolePermissionsTable.$inferSelect;
export type NewRolePermissionDb = typeof rolePermissionsTable.$inferInsert;

export type AddressDb = typeof addressesTable.$inferSelect;
export type NewAddressDb = typeof addressesTable.$inferInsert;

export type VerificationTokenDb = typeof verificationTokensTable.$inferSelect;
export type NewVerificationTokenDb = typeof verificationTokensTable.$inferInsert;

export type OnboardingStateDb = typeof onboardingStatesTable.$inferSelect;
export type NewOnboardingStateDb = typeof onboardingStatesTable.$inferInsert;
