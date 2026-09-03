import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { TokenGeneratorPort } from '../../domain/ports/token-generator.port';
import { SessionEntity } from '../../domain/entities/session.entity';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { CryptoUtils, UnauthorizedException, UserStatus } from '../../../../shared';

@Injectable()
export class RefreshTokenHandler {
  private readonly logger = new Logger(RefreshTokenHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const tokenHash = CryptoUtils.sha256(command.refreshToken);
    const existingSession = await this.authRepository.findSessionByTokenHash(tokenHash);

    if (!existingSession) {
      this.logger.warn('Intento de refresco con token inexistente.');
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }

    if (existingSession.isRevoked) {
      this.logger.error(
        `🚨 Reúso de refresh token detectado para el usuario: ${existingSession.userId}. Revocando todas las sesiones.`,
      );
      await this.authRepository.revokeAllUserSessions(existingSession.userId);
      await this.cacheService.delPattern(`session:${existingSession.userId}:*`);
      await this.authRepository.logSecurityEvent(
        existingSession.userId,
        'TOKEN_REUSE_DETECTED',
        'critical',
        command.ipAddress,
        existingSession.deviceId || undefined,
        { details: 'Intento de reutilización de refresh token ya revocado.' },
      );
      throw new UnauthorizedException('Violación de seguridad detectada. Inicia sesión nuevamente.');
    }

    if (!existingSession.isValid()) {
      throw new UnauthorizedException('La sesión ha caducado.');
    }

    const user = await this.userRepository.findById(existingSession.userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.REJECTED ||
      user.status === UserStatus.LOGICALLY_DELETED
    ) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva o suspendida.');
    }

    await this.authRepository.revokeSession(existingSession.id);
    await this.cacheService.del(`session:${existingSession.userId}:${existingSession.id}`);

    const newAccessToken = await this.tokenGenerator.generateAccessToken({
      sub: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      kycLevel: 0,
    });

    const newRefreshData = this.tokenGenerator.generateRefreshToken();

    const newSession = new SessionEntity({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshTokenHash: newRefreshData.hash,
      deviceId: existingSession.deviceId || null,
      ip: command.ipAddress || existingSession.ip,
      userAgent: command.userAgent || existingSession.userAgent,
      lastSeenAt: new Date(),
      revokedAt: null,
      expiresAt: newRefreshData.expiresAt,
      createdAt: new Date(),
    });

    await this.authRepository.createSession(newSession);
    await this.cacheService.set(`session:${user.id}:${newSession.id}`, true, 7 * 24 * 3600);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshData.token,
      expiresIn: 900,
    };
  }
}
