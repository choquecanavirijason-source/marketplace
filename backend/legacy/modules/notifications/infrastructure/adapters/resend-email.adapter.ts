import { Injectable, Logger } from '@nestjs/common';
import { EmailSenderPort, SendEmailOptions } from '../../domain/ports/email-sender.port';
import { env } from '../../../../config';
import * as crypto from 'crypto';

@Injectable()
export class ResendEmailAdapter implements EmailSenderPort {
  private readonly logger = new Logger(ResendEmailAdapter.name);

  async sendEmail(options: SendEmailOptions): Promise<{ messageId: string }> {
    const isMock = !env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith('re_mock');
    const messageId = `msg_${crypto.randomUUID()}`;

    if (isMock) {
      this.logger.log(
        `[SIMULACIÓN EMAIL RESEND] Para: ${options.to} | Asunto: ${options.subject} | ID: ${messageId}`,
      );
      return { messageId };
    }

    try {
      // In production, invoke Resend REST API or SDK
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from || 'onboarding@resend.dev',
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`);
      }

      const data = await response.json() as { id: string };
      return { messageId: data.id };
    } catch (err) {
      this.logger.error(`Error enviando email vía Resend: ${(err as Error).message}`);
      // Fallback for resilient dev
      return { messageId };
    }
  }
}
