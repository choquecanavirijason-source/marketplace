import { Injectable, Logger } from '@nestjs/common';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { NotFoundException, UnauthorizedException } from '../../../../shared';

@Injectable()
export class RevokeSessionHandler {
  private readonly logger = new Logger(RevokeSessionHandler.name);

  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(userId: string, sessionId: string, ip?: string): Promise<void> {
    const session = await this.authRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundException('Sesión', sessionId);
    }

    if (session.userId !== userId) {
      throw new UnauthorizedException('No tienes permiso para revocar esta sesión.');
    }

    await this.authRepository.revokeSession(sessionId);
    await this.cacheService.del(`session:${userId}:${sessionId}`);

    await this.authRepository.logSecurityEvent(
      userId,
      'SESSION_REVOKED_BY_USER',
      'info',
      ip,
      session.deviceId || undefined,
      { sessionId },
    );

    this.logger.log(`Sesión ${sessionId} revocada remotamente por usuario ${userId}`);
  }
}
