import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { CryptoUtils, BadRequestException, NotFoundException } from '../../../../shared';

@Injectable()
export class ResetPasswordHandler {
  private readonly logger = new Logger(ResetPasswordHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(email: string, token: string, newPassword: string, ip?: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario', email);
    }

    const tokenHash = CryptoUtils.sha256(token);
    const validToken = await this.authRepository.findValidVerificationToken(
      user.id,
      'password_reset',
      tokenHash,
    );

    if (!validToken) {
      throw new BadRequestException('El token de restablecimiento es inválido o ha expirado.');
    }

    await this.authRepository.consumeVerificationToken(validToken.id);

    const newPasswordHash = await CryptoUtils.hashPassword(newPassword);
    const updatedUser = new (user.constructor as any)({
      ...user.toJSON(),
      passwordHash: newPasswordHash,
    });
    await this.userRepository.update(updatedUser);

    await this.authRepository.revokeAllUserSessions(user.id);
    await this.cacheService.delPattern(`session:${user.id}:*`);

    await this.authRepository.logSecurityEvent(
      user.id,
      'PASSWORD_RESET_COMPLETED',
      'warning',
      ip,
      undefined,
      { details: 'Contraseña cambiada exitosamente; todas las sesiones previas fueron revocadas.' },
    );

    this.logger.log(`Contraseña restablecida y sesiones invalidadas para el usuario: ${user.id}`);
  }
}
