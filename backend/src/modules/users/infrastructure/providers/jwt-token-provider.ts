import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenGeneratorPort,
  TokenPayload,
} from '../../domain/ports/token-generator.port';
import { CryptoUtils, DateUtils } from '../../../../shared';
import { appConfig } from '../../../../config';

@Injectable()
export class JwtTokenProvider implements TokenGeneratorPort {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.accessSecret,
      expiresIn: appConfig.jwt.accessExpiresIn as unknown as number,
    });
  }

  generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
    const rawToken = CryptoUtils.generateRandomToken(48);
    const hash = CryptoUtils.sha256(rawToken);
    const expiresAt = DateUtils.addDays(new Date(), 7);

    return {
      token: rawToken,
      hash,
      expiresAt,
    };
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: appConfig.jwt.refreshSecret,
      });
      return payload;
    } catch {
      return null;
    }
  }
}
