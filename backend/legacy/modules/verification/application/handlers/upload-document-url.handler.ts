import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { UploadDocumentUrlCommand } from '../commands/upload-document-url.command';
import { VerificationRepositoryPort } from '../../domain/ports/verification-repository.port';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { StorageService } from '../../../../infrastructure/storage/storage.service';
import { DomainException, KycStatus } from '../../../../shared';

@Injectable()
export class UploadDocumentUrlHandler {
  constructor(
    private readonly verificationRepository: VerificationRepositoryPort,
    private readonly storageService: StorageService,
  ) {}

  async execute(command: UploadDocumentUrlCommand) {
    let verification = await this.verificationRepository.findByUserId(command.userId);
    if (!verification) {
      throw new DomainException('Debes iniciar primero un proceso de verificación.');
    }

    if (verification.status === KycStatus.APPROVED) {
      throw new DomainException('Tu cuenta ya está aprobada.');
    }

    const fileExtension = command.mimeType.split('/')[1] || 'bin';
    const s3Key = `verifications/${verification.id}/${command.documentType.toLowerCase()}_${crypto.randomUUID()}.${fileExtension}`;

    // Get Presigned URL directly to Cloudflare R2 / S3
    const { uploadUrl } = await this.storageService.getPresignedUploadUrl(
      s3Key,
      command.mimeType,
      600, // 10 minutes to upload
    );

    const document = new DocumentEntity({
      id: crypto.randomUUID(),
      verificationId: verification.id,
      documentType: command.documentType,
      s3Key,
      mimeType: command.mimeType,
      fileSizeBytes: command.fileSizeBytes,
      status: 'PENDING_UPLOAD',
      createdAt: new Date(),
    });

    const savedDoc = await this.verificationRepository.addDocument(document);

    return {
      uploadUrl,
      document: savedDoc.toJSON(),
    };
  }
}
