export interface SendWhatsAppOptions {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: string[];
}

export abstract class WhatsAppSenderPort {
  abstract sendTemplateMessage(options: SendWhatsAppOptions): Promise<{ messageId: string }>;
}
