import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  verificationsTable,
  documentsTable,
  VerificationDb,
} from '../../../../infrastructure/database/schema';
import { BiometricalVerifyAdapter, ChallengeResponse } from '../adapters/biometrical-verify.adapter';
import { SubmitKycDto, KycSubmissionResponse, KycStatusResponse } from '../dto';
import { KycStatus, DocumentType } from '../../../../shared';
import { UserRepository } from '../../users/repositories/user.repository';
import { OnboardingStep } from '../../users/enums/onboarding.enum';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly biometricalAdapter: BiometricalVerifyAdapter,
    private readonly userRepository: UserRepository,
  ) {}

  async getChallenge(): Promise<ChallengeResponse> {
    return this.biometricalAdapter.getChallenge();
  }

  private parseBase64(data: string, defaultMime: string): { buffer: Buffer; mimeType: string } {
    let mimeType = defaultMime;
    let base64 = data;

    if (data.startsWith('data:')) {
      const match = data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64 = match[2];
      } else {
        const commaIdx = data.indexOf(',');
        if (commaIdx !== -1) {
          base64 = data.substring(commaIdx + 1);
        }
      }
    }

    try {
      const buffer = Buffer.from(base64, 'base64');
      return { buffer, mimeType };
    } catch {
      throw new BadRequestException('El formato del archivo codificado en Base64 es inválido.');
    }
  }

  async submitVerification(userId: string, dto: SubmitKycDto): Promise<KycSubmissionResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { buffer: idBuffer, mimeType: idMime } = this.parseBase64(
      dto.idImage,
      dto.idImageMimeType || 'image/jpeg',
    );
    const { buffer: videoBuffer, mimeType: videoMime } = this.parseBase64(
      dto.selfieVideo,
      dto.selfieVideoMimeType || 'video/webm',
    );

    if (idBuffer.length < 500) {
      throw new BadRequestException('La imagen del documento es demasiado pequeña o está corrupta.');
    }
    if (videoBuffer.length < 1000) {
      throw new BadRequestException('El video selfie de prueba de vida es demasiado corto o está corrupto.');
    }

    const verificationId = crypto.randomUUID();
    const documentId = crypto.randomUUID();

    // 1. Guardar registro inicial en verificationsTable
    const [verification] = await this.drizzle.db
      .insert(verificationsTable)
      .values({
        id: verificationId,
        userId,
        status: KycStatus.PROCESSING,
        targetLevel: 1,
        provider: 'BIOMETRICAL_VERIFY',
        providerSessionId: null,
        notes: `Reto biométrico: ${dto.challenge}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 2. Guardar metadata del documento
    await this.drizzle.db.insert(documentsTable).values({
      id: documentId,
      verificationId,
      documentType: dto.documentType || DocumentType.NATIONAL_ID,
      s3Key: `kyc/${userId}/${documentId}`,
      mimeType: idMime,
      fileSizeBytes: idBuffer.length,
      status: 'UPLOADED',
      createdAt: new Date(),
    });

    // Registrar paso de onboarding
    await this.userRepository.saveOnboardingStep(userId, OnboardingStep.KYC_SUBMITTED, 'completed');

    // 3. Enviar al VPS Biometrical Verify
    const accepted = await this.biometricalAdapter.submitVerification({
      contractId: userId,
      challenge: dto.challenge,
      nonce: dto.nonce,
      idImageBuffer: idBuffer,
      idImageMimeType: idMime,
      selfieVideoBuffer: videoBuffer,
      selfieVideoMimeType: videoMime,
    });

    // Actualizar providerSessionId con el job_id del VPS
    await this.drizzle.db
      .update(verificationsTable)
      .set({
        providerSessionId: accepted.job_id,
        updatedAt: new Date(),
      })
      .where(eq(verificationsTable.id, verificationId));

    // 4. Evaluar resultado si el procesamiento fue inmediato o síncrono
    try {
      const result = await this.biometricalAdapter.getVerification(accepted.job_id);
      if (result.status === 'done') {
        if (result.decision === 'APPROVE') {
          await this.drizzle.db
            .update(verificationsTable)
            .set({
              status: KycStatus.APPROVED,
              notes: `Similitud: ${Math.round((result.similarity ?? 0) * 100)}%, Liveness: ${Math.round((result.liveness_score ?? 0) * 100)}%`,
              updatedAt: new Date(),
            })
            .where(eq(verificationsTable.id, verificationId));

          await this.userRepository.saveOnboardingStep(userId, OnboardingStep.KYC_APPROVED, 'completed');

          this.logger.log(`✅ Verificación biométrica aprobada para el usuario ${userId}`);

          return {
            verificationId,
            jobId: accepted.job_id,
            status: KycStatus.APPROVED,
            message: '¡Identidad verificada exitosamente!',
          };
        } else if (result.decision === 'REJECT') {
          const reason = result.reason || 'No se superó la prueba de vida o no se detectó rostro coincidente.';
          await this.drizzle.db
            .update(verificationsTable)
            .set({
              status: KycStatus.REJECTED,
              rejectionReason: reason,
              updatedAt: new Date(),
            })
            .where(eq(verificationsTable.id, verificationId));

          this.logger.warn(`❌ Verificación biométrica rechazada para usuario ${userId}: ${reason}`);

          return {
            verificationId,
            jobId: accepted.job_id,
            status: KycStatus.REJECTED,
            message: reason,
          };
        }
      }
    } catch {
      // Si el job aún está en cola en el VPS, se continuará por polling
    }

    return {
      verificationId,
      jobId: accepted.job_id,
      status: KycStatus.PROCESSING,
      message: 'Verificación enviada. Procesando prueba de vida y rostro...',
    };
  }

  async getVerificationStatus(userId: string, jobIdQuery?: string): Promise<KycStatusResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let verification: VerificationDb | undefined;

    if (jobIdQuery) {
      const rows = await this.drizzle.db
        .select()
        .from(verificationsTable)
        .where(eq(verificationsTable.providerSessionId, jobIdQuery))
        .limit(1);
      verification = rows[0];
    }

    if (!verification) {
      const rows = await this.drizzle.db
        .select()
        .from(verificationsTable)
        .where(eq(verificationsTable.userId, userId))
        .orderBy(desc(verificationsTable.createdAt))
        .limit(1);
      verification = rows[0];
    }

    if (!verification) {
      return {
        status: KycStatus.DRAFT,
        kycLevel: user.kycLevel,
        isVerified: user.kycLevel > 0,
      };
    }

    // Si aún está en proceso, consultar al VPS para refrescar estado
    if (verification.status === KycStatus.PROCESSING && verification.providerSessionId) {
      try {
        const result = await this.biometricalAdapter.getVerification(verification.providerSessionId);

        if (result.status === 'done') {
          if (result.decision === 'APPROVE') {
            await this.drizzle.db
              .update(verificationsTable)
              .set({
                status: KycStatus.APPROVED,
                notes: `Similitud: ${Math.round((result.similarity ?? 0) * 100)}%, Liveness: ${Math.round((result.liveness_score ?? 0) * 100)}%`,
                updatedAt: new Date(),
              })
              .where(eq(verificationsTable.id, verification.id));

            await this.userRepository.saveOnboardingStep(userId, OnboardingStep.KYC_APPROVED, 'completed');

            return {
              verificationId: verification.id,
              jobId: verification.providerSessionId,
              status: KycStatus.APPROVED,
              kycLevel: 1,
              decision: 'APPROVE',
              similarity: result.similarity,
              livenessScore: result.liveness_score,
              isVerified: true,
            };
          } else if (result.decision === 'REJECT') {
            const reason = result.reason || 'No se superó la prueba de vida o el rostro no coincide con el documento.';
            await this.drizzle.db
              .update(verificationsTable)
              .set({
                status: KycStatus.REJECTED,
                rejectionReason: reason,
                updatedAt: new Date(),
              })
              .where(eq(verificationsTable.id, verification.id));

            return {
              verificationId: verification.id,
              jobId: verification.providerSessionId,
              status: KycStatus.REJECTED,
              kycLevel: user.kycLevel,
              decision: 'REJECT',
              rejectionReason: reason,
              isVerified: false,
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`Error al consultar estado de verificación con VPS: ${err.message}`);
      }
    }

    const isApproved = verification.status === KycStatus.APPROVED || user.kycLevel > 0;

    return {
      verificationId: verification.id,
      jobId: verification.providerSessionId || undefined,
      status: verification.status as KycStatus,
      kycLevel: isApproved ? Math.max(user.kycLevel, 1) : user.kycLevel,
      decision: isApproved ? 'APPROVE' : verification.status === KycStatus.REJECTED ? 'REJECT' : null,
      rejectionReason: verification.rejectionReason,
      isVerified: isApproved,
    };
  }
}
