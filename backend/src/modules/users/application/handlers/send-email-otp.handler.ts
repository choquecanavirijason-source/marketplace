import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { NodemailerEmailService } from '../../../../infrastructure/mail/nodemailer-email.service';
import { CryptoUtils, DateUtils, NotFoundException } from '../../../../shared';

@Injectable()
export class SendEmailOtpHandler {
  private readonly logger = new Logger(SendEmailOtpHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly mailService: NodemailerEmailService,
  ) {}

  async execute(
    email: string,
    ip?: string,
  ): Promise<{ message: string; debugOtp?: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundException('Usuario con correo electrónico', normalizedEmail);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = CryptoUtils.sha256(otpCode);
    const expiresAt = DateUtils.addMinutes(new Date(), 10);

    await this.authRepository.createVerificationToken(
      user.id,
      'email_otp',
      tokenHash,
      expiresAt,
      JSON.stringify({ email: normalizedEmail }),
    );

    await this.authRepository.logSecurityEvent(
      user.id,
      'EMAIL_OTP_SENT',
      'info',
      ip,
      undefined,
      { email: normalizedEmail },
    );

    this.logger.log(`Enviando código OTP al correo ${normalizedEmail} (Usuario ID: ${user.id})`);

    try {
      await this.mailService.sendOtpEmail(normalizedEmail, otpCode, user.fullName);
    } catch (err: any) {
      this.logger.error(`Error enviando correo OTP a ${normalizedEmail}: ${err.message}`);
    }

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      message: 'Código de verificación enviado correctamente a tu correo electrónico.',
      ...(isDev ? { debugOtp: otpCode } : {}),
    };
  }
}
