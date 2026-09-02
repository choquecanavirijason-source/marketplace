import { Injectable, Logger } from '@nestjs/common';
import { SendOtpCommand } from '../commands/send-otp.command';
import { OtpGeneratorPort } from '../../domain/ports/otp-generator.port';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';
import { WhatsAppSenderPort } from '../../domain/ports/whatsapp-sender.port';
import { QueueService } from '../../../../infrastructure/queue/queue.service';

@Injectable()
export class SendOtpHandler {
  private readonly logger = new Logger(SendOtpHandler.name);

  constructor(
    private readonly otpGenerator: OtpGeneratorPort,
    private readonly emailSender: EmailSenderPort,
    private readonly whatsAppSender: WhatsAppSenderPort,
    private readonly queueService: QueueService,
  ) {}

  async execute(command: SendOtpCommand): Promise<{ success: boolean; message: string }> {
    const otp = this.otpGenerator.generateOtp(6);
    await this.otpGenerator.storeOtp(command.destination, otp, 300); // 5 minutes TTL

    // Queue or direct dispatch
    await this.queueService.addJob('notifications', 'send-otp', {
      destination: command.destination,
      channel: command.channel,
      otp,
    });

    if (command.channel === 'EMAIL') {
      await this.emailSender.sendEmail({
        to: command.destination,
        subject: 'Código de verificación - Marketplace',
        html: `<h2>Tu código de seguridad</h2><p>Tu código de un solo uso es: <strong>${otp}</strong>. Válido por 5 minutos.</p>`,
      });
    } else if (command.channel === 'WHATSAPP') {
      await this.whatsAppSender.sendTemplateMessage({
        to: command.destination,
        templateName: 'otp_verification',
        parameters: [otp],
      });
    }

    this.logger.log(`OTP generado y despachado hacia ${command.destination} por canal ${command.channel}`);
    return {
      success: true,
      message: `Código de verificación enviado a ${command.destination}`,
    };
  }
}
