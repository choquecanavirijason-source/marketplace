import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CryptoUtils, BadRequestException, NotFoundException, OnboardingStep } from '../../../../shared';

@Injectable()
export class VerifyPhoneOtpHandler {
  private readonly logger = new Logger(VerifyPhoneOtpHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  async execute(phone: string, code: string, userId?: string, ip?: string): Promise<void> {
    let targetUser = userId ? await this.userRepository.findById(userId) : null;
    if (!targetUser) {
      targetUser = await this.userRepository.findByPhone(phone);
    }

    if (!targetUser) {
      throw new NotFoundException('Usuario con teléfono', phone);
    }

    const tokenHash = CryptoUtils.sha256(code.trim());
    const validToken = await this.authRepository.findValidVerificationToken(
      targetUser.id,
      'phone_otp',
      tokenHash,
    );

    if (!validToken) {
      throw new BadRequestException('El código de verificación OTP es inválido o ha expirado.');
    }

    await this.authRepository.consumeVerificationToken(validToken.id);

    targetUser.verifyPhone();
    targetUser.calculateCompletionPct();
    await this.userRepository.update(targetUser);

    await this.userRepository.saveOnboardingStep(targetUser.id, OnboardingStep.PHONE_VERIFIED, 'completed');

    await this.authRepository.logSecurityEvent(
      targetUser.id,
      'PHONE_OTP_VERIFIED',
      'info',
      ip,
      undefined,
      { phone },
    );

    this.logger.log(`Teléfono verificado para el usuario: ${targetUser.id} (${phone})`);
  }
}
