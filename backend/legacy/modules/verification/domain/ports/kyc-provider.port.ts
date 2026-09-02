import { KycStatus } from '../../../../shared';

export interface CreateKycSessionResult {
  providerSessionId: string;
  verificationUrl: string;
}

export interface ParsedWebhookEvent {
  providerSessionId: string;
  status: KycStatus;
  rejectionReason?: string;
}

export abstract class KycProviderPort {
  abstract createSession(userId: string, targetLevel: number): Promise<CreateKycSessionResult>;
  abstract verifyWebhookSignature(payload: string, signature: string): boolean;
  abstract parseWebhookEvent(payload: unknown): ParsedWebhookEvent;
}
