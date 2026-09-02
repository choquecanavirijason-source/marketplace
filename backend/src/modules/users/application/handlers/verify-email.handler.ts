import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CryptoUtils, BadRequestException, NotFoundException } from '../../../../shared';

@Injectable()
export class VerifyEmailHandler {
  private readonly logger = new Logger(VerifyEmailHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  async execute(email: string, token: string, ip?: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario', email);
    }

    const tokenHash = CryptoUtils.sha256(token);
    const validToken = await this.authRepository.findValidVerificationToken(
      user.id,
      'email_verification',
      tokenHash,
    );

    if (!validToken) {
      throw new BadRequestException('El token de verificación de correo es inválido o ha expirado.');
    }

    // 1. Consume token
    await this.authRepository.consumeVerificationToken(validToken.id);

    // 2. Mark email verified and update user
    user.verifyEmail();
    user.calculateCompletionPct();
    await this.userRepository.update(user);

    // 3. Update onboarding step
    await this.userRepository.saveOnboardingStep(user.id, 'email_verificado', 'completed');

    // 4. Log event
    await this.authRepository.logSecurityEvent(
      user.id,
      'EMAIL_VERIFIED',
      'info',
      ip,
      undefined,
      { email },
    );

    this.logger.log(`Email verificado para el usuario: ${user.id} (${email})`);
  }
}
