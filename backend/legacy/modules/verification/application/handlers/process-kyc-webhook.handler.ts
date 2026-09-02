import { Injectable, Logger } from '@nestjs/common';
import { VerificationRepositoryPort } from '../../domain/ports/verification-repository.port';
import { KycProviderPort } from '../../domain/ports/kyc-provider.port';
import { UserRepositoryPort } from '../../../identity/domain/ports/user-repository.port';
import { KycStatus, KycLevel } from '../../../../shared';

@Injectable()
export class ProcessKycWebhookHandler {
  private readonly logger = new Logger(ProcessKycWebhookHandler.name);

  constructor(
    private readonly verificationRepository: VerificationRepositoryPort,
    private readonly kycProvider: KycProviderPort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(payload: unknown): Promise<{ status: string }> {
    const event = this.kycProvider.parseWebhookEvent(payload);
    this.logger.log(`Procesando webhook KYC para sesión: ${event.providerSessionId}, estado: ${event.status}`);

    const verification = await this.verificationRepository.findByProviderSessionId(event.providerSessionId);
    if (!verification) {
      this.logger.warn(`No se encontró verificación para la sesión KYC: ${event.providerSessionId}`);
      return { status: 'IGNORED_SESSION_NOT_FOUND' };
    }

    if (event.status === KycStatus.APPROVED) {
      verification.approve();
      await this.verificationRepository.update(verification);

      // Elevate user's KYC level
      const user = await this.userRepository.findById(verification.userId);
      if (user) {
        user.updateKycLevel(verification.targetLevel as KycLevel);
        await this.userRepository.update(user);
        this.logger.log(`Nivel KYC elevado para usuario: ${user.id} a nivel ${verification.targetLevel}`);
      }
    } else if (event.status === KycStatus.REJECTED) {
      verification.reject(event.rejectionReason || 'Verificación rechazada por el proveedor.');
      await this.verificationRepository.update(verification);
    } else if (event.status === KycStatus.REVIEW_NEEDED) {
      verification.requestReview();
      await this.verificationRepository.update(verification);
    }

    return { status: 'PROCESSED' };
  }
}
