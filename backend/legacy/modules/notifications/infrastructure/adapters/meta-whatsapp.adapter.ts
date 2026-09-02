import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppSenderPort, SendWhatsAppOptions } from '../../domain/ports/whatsapp-sender.port';
import { env } from '../../../../config';
import * as crypto from 'crypto';

@Injectable()
export class MetaWhatsAppAdapter implements WhatsAppSenderPort {
  private readonly logger = new Logger(MetaWhatsAppAdapter.name);

  async sendTemplateMessage(options: SendWhatsAppOptions): Promise<{ messageId: string }> {
    const isMock = !env.WHATSAPP_API_TOKEN || env.WHATSAPP_API_TOKEN.startsWith('mock');
    const messageId = `wamid.${crypto.randomUUID()}`;

    if (isMock) {
      this.logger.log(
        `[SIMULACIÓN WHATSAPP META] Para: ${options.to} | Plantilla: ${options.templateName} | ID: ${messageId}`,
      );
      return { messageId };
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: options.to,
            type: 'template',
            template: {
              name: options.templateName,
              language: { code: options.languageCode || 'es' },
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const data = await response.json() as { messages: [{ id: string }] };
      return { messageId: data.messages[0].id };
    } catch (err) {
      this.logger.error(`Error enviando WhatsApp vía Meta: ${(err as Error).message}`);
      return { messageId };
    }
  }
}
