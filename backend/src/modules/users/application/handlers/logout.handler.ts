import { Injectable, Logger } from '@nestjs/common';
import { LogoutCommand } from '../commands/logout.command';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { CryptoUtils } from '../../../../shared';

@Injectable()
export class LogoutHandler {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    if (command.refreshToken) {
      const tokenHash = CryptoUtils.sha256(command.refreshToken);
      const session = await this.authRepository.findSessionByTokenHash(tokenHash);
      if (session) {
        await this.authRepository.revokeSession(session.id);
        await this.cacheService.del(`session:${command.userId}:${session.id}`);
      }
    } else {
      // Revoke all sessions for this user
      await this.authRepository.revokeAllUserSessions(command.userId);
      await this.cacheService.delPattern(`session:${command.userId}:*`);
    }

    this.logger.log(`Sesión cerrada para el usuario: ${command.userId}`);
  }
}
