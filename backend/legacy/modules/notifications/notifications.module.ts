import { Module } from '@nestjs/common';
import { NotificationsController } from './presentation/notifications.controller';
import { SendOtpHandler } from './application/handlers/send-otp.handler';
import { OnUserRegisteredListener } from './application/handlers/on-user-registered.listener';
import { EmailSenderPort } from './domain/ports/email-sender.port';
import { ResendEmailAdapter } from './infrastructure/adapters/resend-email.adapter';
import { WhatsAppSenderPort } from './domain/ports/whatsapp-sender.port';
import { MetaWhatsAppAdapter } from './infrastructure/adapters/meta-whatsapp.adapter';
import { OtpGeneratorPort } from './domain/ports/otp-generator.port';
import { SecureOtpGenerator } from './infrastructure/generators/secure-otp.generator';

@Module({
  controllers: [NotificationsController],
  providers: [
    SendOtpHandler,
    OnUserRegisteredListener,
    {
      provide: EmailSenderPort,
      useClass: ResendEmailAdapter,
    },
    {
      provide: WhatsAppSenderPort,
      useClass: MetaWhatsAppAdapter,
    },
    {
      provide: OtpGeneratorPort,
      useClass: SecureOtpGenerator,
    },
  ],
  exports: [EmailSenderPort, WhatsAppSenderPort, OtpGeneratorPort],
})
export class NotificationsModule {}
