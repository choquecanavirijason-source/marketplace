import { Injectable, Logger } from '@nestjs/common';
import { env } from '../../../../config/env-schema';
import { SocialUserProfile } from './google-oauth.adapter';

@Injectable()
export class FacebookOAuthAdapter {
  private readonly logger = new Logger(FacebookOAuthAdapter.name);

  private readonly appId = env.FACEBOOK_APP_ID || '';
  private readonly appSecret = env.FACEBOOK_APP_SECRET || '';
  private readonly callbackUrl = `${env.BACKEND_URL}/api/v1/auth/facebook/callback`;

  getAuthorizationUrl(state: string): string {
    if (!this.appId || !this.appSecret) {
      this.logger.warn('FACEBOOK_APP_ID o FACEBOOK_APP_SECRET no están configurados. Usando endpoint de simulación para desarrollo.');
      return `${this.callbackUrl}?code=mock_facebook_auth_code&state=${encodeURIComponent(state)}`;
    }

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.callbackUrl,
      state,
      scope: 'email,public_profile',
      response_type: 'code',
    });

    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async getUserProfile(code: string): Promise<SocialUserProfile> {
    if (code.startsWith('mock_') || !this.appId || !this.appSecret) {
      this.logger.log('Procesando login simulado de Facebook para entorno de desarrollo.');
      return {
        email: 'usuario.facebook@ferromax.com',
        firstName: 'Usuario',
        lastName: 'Facebook',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        provider: 'facebook',
        providerId: 'facebook_mock_id_12345',
      };
    }

    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', this.appId);
    tokenUrl.searchParams.set('client_secret', this.appSecret);
    tokenUrl.searchParams.set('redirect_uri', this.callbackUrl);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      this.logger.error(`Error al intercambiar código con Facebook: ${errorData}`);
      throw new Error('No se pudo verificar el código de autorización con Facebook');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string; token_type: string };

    const userUrl = new URL('https://graph.facebook.com/me');
    userUrl.searchParams.set('fields', 'id,first_name,last_name,name,email,picture.width(200).height(200)');
    userUrl.searchParams.set('access_token', tokenData.access_token);

    const userInfoResponse = await fetch(userUrl.toString(), {
      method: 'GET',
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.text();
      this.logger.error(`Error al obtener información de perfil de Facebook: ${errorData}`);
      throw new Error('No se pudo obtener la información de perfil de Facebook');
    }

    const userInfo = (await userInfoResponse.json()) as {
      id: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      name?: string;
      picture?: {
        data?: {
          url?: string;
        };
      };
    };

    const email = userInfo.email || `fb_${userInfo.id}@marketplace.local`;
    const firstName = userInfo.first_name || userInfo.name?.split(' ')[0] || 'Usuario';
    const lastName = userInfo.last_name || userInfo.name?.split(' ').slice(1).join(' ') || 'Facebook';
    const avatarUrl = userInfo.picture?.data?.url;

    return {
      email,
      firstName,
      lastName,
      avatarUrl,
      provider: 'facebook',
      providerId: userInfo.id,
    };
  }
}
