import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendTemplatedEmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  from?: string;
}

@Injectable()
export class NodemailerEmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly compiledTemplates = new Map<string, handlebars.TemplateDelegate>();

  constructor() {
    this.initializeTransporter();
    this.registerHandlebarsHelpers();
  }

  private registerHandlebarsHelpers() {
    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('year', () => new Date().getFullYear());
  }

  private initializeTransporter() {
    const user = process.env.SMTP_USER;
    let pass = (process.env.SMTP_PASS || '').trim();
    if (pass.startsWith('"') && pass.endsWith('"')) {
      pass = pass.slice(1, -1);
    }
    pass = pass.replace(/\s+/g, '');

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

  private loadTemplateContent(templateName: string): string | null {
    const candidatePaths = [
      path.join(__dirname, 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'dist', 'infrastructure', 'mail', 'templates', `${templateName}.hbs`),
      path.join(process.cwd(), 'src', 'infrastructure', 'mail', 'templates', `${templateName}.hbs`),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8');
      }
    }
    return null;
  }

  renderTemplate(templateName: string, context: Record<string, any>): string {
    const cached = this.compiledTemplates.get(templateName);
    if (cached) {
      return cached({ year: new Date().getFullYear(), ...context });
    }

    let content = this.loadTemplateContent(templateName);

    if (!content) {
      this.logger.warn(`Plantilla Handlebars '${templateName}' no encontrada. Usando plantilla 'fallback.hbs'.`);
      content = this.loadTemplateContent('fallback');
    }

    if (!content) {
      throw new Error(`No se encontró la plantilla Handlebars '${templateName}' ni la plantilla de respaldo 'fallback.hbs'.`);
    }

    const compiled = handlebars.compile(content);
    this.compiledTemplates.set(templateName, compiled);
    return compiled({ year: new Date().getFullYear(), ...context });
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const user = process.env.SMTP_USER;
    const defaultFrom = user ? `"FerroMax Marketplace" <${user}>` : '"FerroMax Marketplace" <no-reply@ferromax.com>';
    const from = options.from || defaultFrom;

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

  async sendTemplatedEmail(options: SendTemplatedEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const html = this.renderTemplate(options.template, options.context);
    return this.sendEmail({
      to: options.to,
      subject: options.subject,
      html,
      from: options.from,
    });
  }

  async sendOtpEmail(to: string, otpCode: string, name?: string): Promise<{ success: boolean; messageId?: string }> {
    return this.sendTemplatedEmail({
      to,
      subject: `${otpCode} es tu código de verificación FerroMax`,
      template: 'otp-login',
      context: {
        name: name || 'Usuario',
        otpCode,
        expiresIn: '10 minutos',
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    resetCode: string,
    name?: string,
    resetUrl?: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendTemplatedEmail({
      to,
      subject: 'Recuperación de Contraseña — FerroMax Marketplace',
      template: 'password-reset',
      context: {
        name: name || 'Usuario',
        email: to,
        resetCode,
        resetUrl,
        expiresIn: '1 hora',
      },
    });
  }

  async sendEmailVerification(
    to: string,
    code: string,
    name?: string,
    verifyUrl?: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendTemplatedEmail({
      to,
      subject: 'Verifica tu correo electrónico — FerroMax Marketplace',
      template: 'email-verification',
      context: {
        name: name || 'Usuario',
        email: to,
        code,
        verifyUrl,
        expiresIn: '24 horas',
      },
    });
  }
}
