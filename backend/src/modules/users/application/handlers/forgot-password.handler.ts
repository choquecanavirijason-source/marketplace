import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CryptoUtils, DateUtils } from '../../../../shared';

@Injectable()
export class ForgotPasswordHandler {
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  async execute(email: string, ip?: string): Promise<{ message: string; debugToken?: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return {
        message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    const rawToken = CryptoUtils.generateRandomToken(32);
    const tokenHash = CryptoUtils.sha256(rawToken);
    const expiresAt = DateUtils.addHours(new Date(), 2);

    await this.authRepository.createVerificationToken(
      user.id,
      'password_reset',
      tokenHash,
      expiresAt,
    );

    await this.authRepository.logSecurityEvent(
      user.id,
      'PASSWORD_RESET_REQUESTED',
      'info',
      ip,
      undefined,
      { email },
    );

    this.logger.log(`Token de recuperación generado para usuario: ${user.id}`);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
      ...(isDev ? { debugToken: rawToken } : {}),
    };
  }
}
