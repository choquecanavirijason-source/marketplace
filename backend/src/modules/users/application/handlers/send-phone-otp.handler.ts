import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { CryptoUtils, DateUtils, NotFoundException } from '../../../../shared';

@Injectable()
export class SendPhoneOtpHandler {
  private readonly logger = new Logger(SendPhoneOtpHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  async execute(
    phone: string,
    userId?: string,
    ip?: string,
  ): Promise<{ message: string; debugOtp?: string }> {
    let targetUserId = userId;

    if (!targetUserId) {
      const user = await this.userRepository.findByPhone(phone);
      if (!user) {
        throw new NotFoundException('Usuario con teléfono', phone);
      }
      targetUserId = user.id;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = CryptoUtils.sha256(otpCode);
    const expiresAt = DateUtils.addMinutes(new Date(), 10);

    await this.authRepository.createVerificationToken(
      targetUserId,
      'phone_otp',
      tokenHash,
      expiresAt,
      JSON.stringify({ phone }),
    );

    await this.authRepository.logSecurityEvent(
      targetUserId,
      'PHONE_OTP_SENT',
      'info',
      ip,
      undefined,
      { phone },
    );

    this.logger.log(`Código OTP enviado al teléfono ${phone} para el usuario ${targetUserId}`);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      message: 'Código de verificación enviado correctamente a tu número de teléfono.',
      ...(isDev ? { debugOtp: otpCode } : {}),
    };
  }
}
