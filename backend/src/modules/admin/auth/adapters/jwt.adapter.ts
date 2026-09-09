import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenGeneratorPort,
  TokenPayload,
  GeneratedTokens,
} from '../interfaces/token-generator.interface';
import { CryptoUtils, DateUtils } from '../../../../shared';
import { appConfig } from '../../../../config';

@Injectable()
export class JwtAdapter implements TokenGeneratorPort {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(payload: TokenPayload): Promise<GeneratedTokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.accessSecret,
      expiresIn: appConfig.jwt.accessExpiresIn as unknown as number,
    });
    const refreshToken = CryptoUtils.generateRandomToken(48);
    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: appConfig.jwt.accessSecret,
    });
  }

  async hashRefreshToken(token: string): Promise<string> {
    return CryptoUtils.sha256(token);
  }

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

export const JwtTokenProvider = JwtAdapter;
