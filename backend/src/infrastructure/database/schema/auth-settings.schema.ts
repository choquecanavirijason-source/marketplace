import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';

export const authSettingsTable = pgTable('auth_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  emailPasswordEnabled: boolean('email_password_enabled').default(true).notNull(),
  phoneOtpEnabled: boolean('phone_otp_enabled').default(true).notNull(),
  socialLoginEnabled: boolean('social_login_enabled').default(true).notNull(),
  googleAuthEnabled: boolean('google_auth_enabled').default(true).notNull(),
  googleClientId: text('google_client_id'),
  facebookAuthEnabled: boolean('facebook_auth_enabled').default(true).notNull(),
  facebookClientId: text('facebook_client_id'),
  appleAuthEnabled: boolean('apple_auth_enabled').default(true).notNull(),
  appleClientId: text('apple_client_id'),
  defaultAuthMethod: varchar('default_auth_method', { length: 20 }).default('email').notNull(),
  requireEmailVerification: boolean('require_email_verification').default(false).notNull(),
  requirePhoneVerification: boolean('require_phone_verification').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AuthSettingsDb = typeof authSettingsTable.$inferSelect;
export type NewAuthSettingsDb = typeof authSettingsTable.$inferInsert;
