import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class NodemailerEmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`Nodemailer configurado con Gmail SMTP (${user})`);
    } else {
      this.logger.warn(
        'Nodemailer no tiene configuradas las variables SMTP_USER y SMTP_PASS. Los correos se registrarán en los logs de consola.',
      );
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const from = options.from || process.env.SMTP_FROM || '"FerroMax Marketplace" <no-reply@ferromax.com>';

    if (!this.transporter) {
      this.logger.log(`[SIMULACIÓN CORREO] Para: ${options.to} | Asunto: ${options.subject}`);
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Correo enviado satisfactoriamente a ${options.to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      this.logger.error(`Error enviando correo a ${options.to}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendOtpEmail(to: string, otpCode: string, name?: string): Promise<{ success: boolean; messageId?: string }> {
    const greeting = name ? `Hola <strong>${name}</strong>,` : 'Hola,';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ea580c; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">FerroMax</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Marketplace</p>
        </div>

        <div style="border-top: 1px solid #f3f4f6; padding-top: 24px;">
          <p style="color: #1f2937; font-size: 15px; line-height: 24px; margin: 0 0 16px 0;">
            ${greeting}
          </p>
          <p style="color: #4b5563; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
            Has solicitado un código de verificación de un solo uso (OTP) para acceder a tu cuenta en FerroMax.
          </p>

          <div style="background-color: #fff7ed; border: 2px dashed #f97316; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ea580c; font-family: monospace;">
              ${otpCode}
            </span>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 20px; margin: 20px 0 0 0; text-align: center;">
            Este código es válido durante <strong>10 minutos</strong>. Nunca compartas este código con nadie.
          </p>
        </div>

        <div style="border-top: 1px solid #f3f4f6; margin-top: 32px; padding-top: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Si no solicitaste este código, puedes ignorar este correo de forma segura.
          </p>
          <p style="color: #d1d5db; font-size: 11px; margin: 8px 0 0 0;">
            © ${new Date().getFullYear()} FerroMax Marketplace. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `${otpCode} es tu código de verificación FerroMax`,
      html,
    });
  }
}
