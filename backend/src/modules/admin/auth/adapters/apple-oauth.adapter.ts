import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env-schema';
import { SocialUserProfile } from './google-oauth.adapter';

@Injectable()
export class AppleOAuthAdapter {
  private readonly logger = new Logger(AppleOAuthAdapter.name);

  private readonly clientId = env.APPLE_CLIENT_ID || '';
  private readonly callbackUrl = `${env.BACKEND_URL}/api/v1/auth/apple/callback`;

  getAuthorizationUrl(state: string): string {
    if (!this.clientId) {
      this.logger.warn('APPLE_CLIENT_ID no está configurado. Usando endpoint de simulación para desarrollo.');
      return `${this.callbackUrl}?code=mock_apple_auth_code&state=${encodeURIComponent(state)}`;
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code id_token',
      response_mode: 'form_post',
      scope: 'name email',
      state,
    });

    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  async getUserProfile(
    code: string,
    rawAppleData?: { id_token?: string; user?: string | { name?: { firstName?: string; lastName?: string }; email?: string } },
  ): Promise<SocialUserProfile> {
    if (code.startsWith('mock_') || !this.clientId) {
      this.logger.log('Procesando login simulado de Apple para entorno de desarrollo.');
      return {
        email: 'usuario.apple@ferromax.com',
        firstName: 'Usuario',
        lastName: 'Apple',
        avatarUrl: undefined,
        provider: 'apple',
        providerId: 'apple_mock_id_12345',
      };
    }

    let sub = '';
    let email = '';

    if (rawAppleData?.id_token) {
      try {
        const parts = rawAppleData.id_token.split('.');
        if (parts.length >= 2) {
          const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          sub = payload.sub;
          email = payload.email;
        }
      } catch (err: any) {
        this.logger.error(`Error al decodificar el id_token de Apple: ${err.message}`);
      }
    }

    let firstName = 'Usuario';
    let lastName = 'Apple';

    if (rawAppleData?.user) {
      try {
        const userData =
          typeof rawAppleData.user === 'string'
            ? JSON.parse(rawAppleData.user)
            : rawAppleData.user;

        if (userData?.name?.firstName) firstName = userData.name.firstName;
        if (userData?.name?.lastName) lastName = userData.name.lastName;
        if (userData?.email && !email) email = userData.email;
      } catch (err: any) {
        this.logger.warn(`No se pudo parsear el campo 'user' enviado por Apple: ${err.message}`);
      }
    }

    if (!sub) {
      sub = code;
    }

    if (!email) {
      email = `apple_${sub.substring(0, 10)}@marketplace.local`;
    }

    return {
      email,
      firstName,
      lastName,
      avatarUrl: undefined,
      provider: 'apple',
      providerId: sub,
    };
  }
}
