export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export abstract class EmailSenderPort {
  abstract sendEmail(options: SendEmailOptions): Promise<{ messageId: string }>;
}
