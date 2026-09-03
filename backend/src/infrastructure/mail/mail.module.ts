import { Module, Global } from '@nestjs/common';
import { NodemailerEmailService } from './nodemailer-email.service';

@Global()
@Module({
  providers: [NodemailerEmailService],
  exports: [NodemailerEmailService],
})
export class MailModule {}
