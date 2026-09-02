import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  KycProviderPort,
  CreateKycSessionResult,
  ParsedWebhookEvent,
} from '../../domain/ports/kyc-provider.port';
import { CryptoUtils, KycStatus } from '../../../../shared';
import { env } from '../../../../config';

@Injectable()
export class MockKycAdapter implements KycProviderPort {
  private readonly logger = new Logger(MockKycAdapter.name);

  async createSession(userId: string, targetLevel: number): Promise<CreateKycSessionResult> {
    const providerSessionId = `kyc_sess_${crypto.randomUUID()}`;
    const verificationUrl = `https://kyc-sandbox.marketplace.com/verify?session=${providerSessionId}&user=${userId}&level=${targetLevel}`;

    this.logger.log(`Sesión KYC creada para usuario: ${userId}, sesión: ${providerSessionId}`);
    return {
      providerSessionId,
      verificationUrl,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    return CryptoUtils.verifyHmacSha256(payload, signature, env.KYC_WEBHOOK_SECRET);
  }

  parseWebhookEvent(payload: Record<string, unknown>): ParsedWebhookEvent {
    const providerSessionId = String(payload.sessionId || payload.session_id || '');
    const rawStatus = String(payload.status || '').toUpperCase();

    let status = KycStatus.PROCESSING;
    let rejectionReason: string | undefined;

    if (rawStatus === 'APPROVED' || rawStatus === 'COMPLETED') {
      status = KycStatus.APPROVED;
    } else if (rawStatus === 'REJECTED' || rawStatus === 'FAILED') {
      status = KycStatus.REJECTED;
      rejectionReason = String(payload.reason || 'Documentos ilegibles o inconsistentes.');
    } else if (rawStatus === 'REVIEW_NEEDED') {
      status = KycStatus.REVIEW_NEEDED;
    }

    return {
      providerSessionId,
      status,
      rejectionReason,
    };
  }
}
