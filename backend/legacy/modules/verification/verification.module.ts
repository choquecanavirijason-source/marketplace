import { Module } from '@nestjs/common';
import { VerificationController } from './presentation/verification.controller';
import { WebhookController } from './presentation/webhook.controller';
import { StartVerificationHandler } from './application/handlers/start-verification.handler';
import { UploadDocumentUrlHandler } from './application/handlers/upload-document-url.handler';
import { ProcessKycWebhookHandler } from './application/handlers/process-kyc-webhook.handler';
import { VerificationRepositoryPort } from './domain/ports/verification-repository.port';
import { PostgresVerificationRepository } from './infrastructure/repositories/postgres-verification.repository';
import { KycProviderPort } from './domain/ports/kyc-provider.port';
import { MockKycAdapter } from './infrastructure/adapters/mock-kyc.adapter';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [VerificationController, WebhookController],
  providers: [
    StartVerificationHandler,
    UploadDocumentUrlHandler,
    ProcessKycWebhookHandler,
    {
      provide: VerificationRepositoryPort,
      useClass: PostgresVerificationRepository,
    },
    {
      provide: KycProviderPort,
      useClass: MockKycAdapter,
    },
  ],
  exports: [VerificationRepositoryPort, KycProviderPort],
})
export class VerificationModule {}
