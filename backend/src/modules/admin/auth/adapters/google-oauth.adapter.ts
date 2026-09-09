import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env-schema';

export interface SocialUserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  provider: 'google' | 'facebook' | 'apple';
  providerId: string;
}

@Injectable()
export class GoogleOAuthAdapter {
  private readonly logger = new Logger(GoogleOAuthAdapter.name);

  private readonly clientId = env.GOOGLE_CLIENT_ID || '';
  private readonly clientSecret = env.GOOGLE_CLIENT_SECRET || '';
  private readonly callbackUrl = `${env.BACKEND_URL}/api/v1/auth/google/callback`;

  getAuthorizationUrl(state: string): string {
    if (!this.clientId) {
      this.logger.warn('GOOGLE_CLIENT_ID no está configurado. Usando endpoint de simulación para desarrollo.');
      return `${this.callbackUrl}?code=mock_google_auth_code&state=${encodeURIComponent(state)}`;
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getUserProfile(code: string): Promise<SocialUserProfile> {
    if (code.startsWith('mock_') || !this.clientId || !this.clientSecret) {
      this.logger.log('Procesando login simulado de Google para entorno de desarrollo.');
      return {
        email: 'usuario.google@ferromax.com',
        firstName: 'Usuario',
        lastName: 'Google',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        provider: 'google',
        providerId: 'google_mock_id_12345',
      };
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.callbackUrl,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      this.logger.error(`Error al intercambiar código con Google: ${errorData}`);
      throw new Error('No se pudo verificar el código de autorización con Google');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string; id_token?: string };

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('No se pudo obtener la información de perfil de Google');
    }

    const userInfo = (await userInfoResponse.json()) as {
      sub: string;
      email: string;
      given_name?: string;
      family_name?: string;
      name?: string;
      picture?: string;
    };

    return {
      email: userInfo.email,
      firstName: userInfo.given_name || userInfo.name || 'Usuario',
      lastName: userInfo.family_name || 'Google',
      avatarUrl: userInfo.picture,
      provider: 'google',
      providerId: userInfo.sub,
    };
  }
}
