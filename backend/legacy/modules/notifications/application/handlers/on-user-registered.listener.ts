import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../../../identity/domain/events/user-registered.event';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';
import { QueueService } from '../../../../infrastructure/queue/queue.service';

@Injectable()
export class OnUserRegisteredListener {
  private readonly logger = new Logger(OnUserRegisteredListener.name);

  constructor(
    private readonly emailSender: EmailSenderPort,
    private readonly queueService: QueueService,
  ) {}

  @OnEvent(UserRegisteredEvent.EVENT_NAME, { async: true })
  async handleUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(`Evento recibido: ${UserRegisteredEvent.EVENT_NAME} para ${event.user.email}`);

    // Push to queue for audit/processing
    await this.queueService.addJob('notifications', 'welcome-email', {
      userId: event.user.id,
      email: event.user.email,
    });

    await this.emailSender.sendEmail({
      to: event.user.email,
      subject: '¡Bienvenido a Marketplace!',
      html: `<h1>¡Bienvenido/a ${event.user.firstName}!</h1><p>Gracias por unirte a nuestra plataforma.</p>`,
    });
  }
}
