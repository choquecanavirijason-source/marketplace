import { Injectable, Logger } from '@nestjs/common';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';

@Injectable()
export class LogoutAllHandler {
  private readonly logger = new Logger(LogoutAllHandler.name);

  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(userId: string, ip?: string): Promise<void> {
    await this.authRepository.revokeAllUserSessions(userId);
    await this.cacheService.delPattern(`session:${userId}:*`);

    await this.authRepository.logSecurityEvent(
      userId,
      'LOGOUT_ALL_SESSIONS',
      'info',
      ip,
      undefined,
      { reason: 'User requested global logout of all sessions' },
    );

    this.logger.log(`Todas las sesiones cerradas para el usuario: ${userId}`);
  }
}
