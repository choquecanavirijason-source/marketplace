import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import { authSettingsTable, AuthSettingsDb } from '../../../../infrastructure/database/schema';
import { UpdateAuthSettingsDto } from '../dto/auth/auth-settings.dto';

export interface PublicAuthSettings {
  emailPasswordEnabled: boolean;
  phoneOtpEnabled: boolean;
  socialLoginEnabled: boolean;
  googleAuthEnabled: boolean;
  facebookAuthEnabled: boolean;
  appleAuthEnabled: boolean;
  defaultAuthMethod: string;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
}

@Injectable()
export class AuthConfigService {
  private readonly logger = new Logger(AuthConfigService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  private getDefaultSettings(): AuthSettingsDb {
    return {
      id: 'default',
      emailPasswordEnabled: true,
      phoneOtpEnabled: true,
      socialLoginEnabled: true,
      googleAuthEnabled: true,
      googleClientId: null,
      facebookAuthEnabled: true,
      facebookClientId: null,
      appleAuthEnabled: true,
      appleClientId: null,
      defaultAuthMethod: 'email',
      requireEmailVerification: false,
      requirePhoneVerification: false,
      updatedAt: new Date(),
    };
  }

  async getSettings(): Promise<AuthSettingsDb> {
    try {
      const [settings] = await this.drizzle.db
        .select()
        .from(authSettingsTable)
        .limit(1);

      if (!settings) {
        const defaultSet = this.getDefaultSettings();
        const [created] = await this.drizzle.db
          .insert(authSettingsTable)
          .values({
            emailPasswordEnabled: defaultSet.emailPasswordEnabled,
            phoneOtpEnabled: defaultSet.phoneOtpEnabled,
            socialLoginEnabled: defaultSet.socialLoginEnabled,
            googleAuthEnabled: defaultSet.googleAuthEnabled,
            facebookAuthEnabled: defaultSet.facebookAuthEnabled,
            appleAuthEnabled: defaultSet.appleAuthEnabled,
            defaultAuthMethod: defaultSet.defaultAuthMethod,
            requireEmailVerification: defaultSet.requireEmailVerification,
            requirePhoneVerification: defaultSet.requirePhoneVerification,
          })
          .returning();
        return created || defaultSet;
      }

      return settings;
    } catch (error) {
      this.logger.warn('No se pudo consultar auth_settings desde DB, usando defaults en memoria:', error);
      return this.getDefaultSettings();
    }
  }

  async getPublicConfig(): Promise<PublicAuthSettings> {
    const settings = await this.getSettings();
    return {
      emailPasswordEnabled: settings.emailPasswordEnabled,
      phoneOtpEnabled: settings.phoneOtpEnabled,
      socialLoginEnabled: settings.socialLoginEnabled,
      googleAuthEnabled: settings.socialLoginEnabled && settings.googleAuthEnabled,
      facebookAuthEnabled: settings.socialLoginEnabled && settings.facebookAuthEnabled,
      appleAuthEnabled: settings.socialLoginEnabled && settings.appleAuthEnabled,
      defaultAuthMethod: settings.defaultAuthMethod,
      requireEmailVerification: settings.requireEmailVerification,
      requirePhoneVerification: settings.requirePhoneVerification,
    };
  }

  async updateSettings(dto: UpdateAuthSettingsDto): Promise<AuthSettingsDb> {
    const current = await this.getSettings();

    const updateData: Partial<typeof authSettingsTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.emailPasswordEnabled !== undefined) updateData.emailPasswordEnabled = dto.emailPasswordEnabled;
    if (dto.phoneOtpEnabled !== undefined) updateData.phoneOtpEnabled = dto.phoneOtpEnabled;
    if (dto.socialLoginEnabled !== undefined) updateData.socialLoginEnabled = dto.socialLoginEnabled;
    if (dto.googleAuthEnabled !== undefined) updateData.googleAuthEnabled = dto.googleAuthEnabled;
    if (dto.googleClientId !== undefined) updateData.googleClientId = dto.googleClientId;
    if (dto.facebookAuthEnabled !== undefined) updateData.facebookAuthEnabled = dto.facebookAuthEnabled;
    if (dto.facebookClientId !== undefined) updateData.facebookClientId = dto.facebookClientId;
    if (dto.appleAuthEnabled !== undefined) updateData.appleAuthEnabled = dto.appleAuthEnabled;
    if (dto.appleClientId !== undefined) updateData.appleClientId = dto.appleClientId;
    if (dto.defaultAuthMethod !== undefined) updateData.defaultAuthMethod = dto.defaultAuthMethod;
    if (dto.requireEmailVerification !== undefined) updateData.requireEmailVerification = dto.requireEmailVerification;
    if (dto.requirePhoneVerification !== undefined) updateData.requirePhoneVerification = dto.requirePhoneVerification;

    const [updated] = await this.drizzle.db
      .update(authSettingsTable)
      .set(updateData)
      .where(eq(authSettingsTable.id, current.id))
      .returning();

    this.logger.log('✅ Configuración de autenticación actualizada por el administrador.');
    return updated || current;
  }
}
