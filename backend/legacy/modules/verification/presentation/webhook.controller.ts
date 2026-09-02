import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProcessKycWebhookHandler } from '../application/handlers/process-kyc-webhook.handler';
import { WebhookSignatureGuard, Public } from '../../../common';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly processWebhookHandler: ProcessKycWebhookHandler) {}

  @Public()
  @UseGuards(WebhookSignatureGuard)
  @Post('kyc')
  @HttpCode(HttpStatus.OK)
  async handleKycWebhook(@Body() payload: Record<string, unknown>) {
    return this.processWebhookHandler.execute(payload);
  }
}
