import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { StartVerificationCommand } from '../commands/start-verification.command';
import { VerificationRepositoryPort } from '../../domain/ports/verification-repository.port';
import { KycProviderPort } from '../../domain/ports/kyc-provider.port';
import { VerificationEntity } from '../../domain/entities/verification.entity';
import { KycStatus, DomainException } from '../../../../shared';

@Injectable()
export class StartVerificationHandler {
  private readonly logger = new Logger(StartVerificationHandler.name);

  constructor(
    private readonly verificationRepository: VerificationRepositoryPort,
    private readonly kycProvider: KycProviderPort,
  ) {}

  async execute(command: StartVerificationCommand) {
    const existing = await this.verificationRepository.findByUserId(command.userId);
    if (existing && existing.status === KycStatus.APPROVED) {
      throw new DomainException('Tu identidad ya ha sido verificada satisfactoriamente.');
    }

    if (existing && existing.status === KycStatus.PROCESSING) {
      throw new DomainException('Ya tienes un proceso de verificación en curso.');
    }

    const sessionData = await this.kycProvider.createSession(
      command.userId,
      command.targetLevel,
    );

    let verification: VerificationEntity;

    if (existing) {
      existing.markProcessing(sessionData.providerSessionId);
      verification = await this.verificationRepository.update(existing);
    } else {
      const newEntity = new VerificationEntity({
        id: crypto.randomUUID(),
        userId: command.userId,
        status: KycStatus.PROCESSING,
        targetLevel: command.targetLevel,
        provider: 'KYC_PROVIDER',
        providerSessionId: sessionData.providerSessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      verification = await this.verificationRepository.create(newEntity);
    }

    this.logger.log(`Proceso KYC iniciado para usuario: ${command.userId}`);
    return {
      verification: verification.toJSON(),
      verificationUrl: sessionData.verificationUrl,
    };
  }
}
