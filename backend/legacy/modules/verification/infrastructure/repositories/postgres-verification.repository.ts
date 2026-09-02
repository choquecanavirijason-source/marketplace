import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { VerificationRepositoryPort } from '../../domain/ports/verification-repository.port';
import { VerificationEntity } from '../../domain/entities/verification.entity';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  verificationsTable,
  documentsTable,
  VerificationDb,
  DocumentDb,
} from '../../../../infrastructure/database/schema/kyc.schema';
import { KycStatus, DocumentType } from '../../../../shared';

@Injectable()
export class PostgresVerificationRepository implements VerificationRepositoryPort {
  constructor(private readonly drizzle: DrizzleService) {}

  private toDomainVerification(row: VerificationDb): VerificationEntity {
    return new VerificationEntity({
      id: row.id,
      userId: row.userId,
      status: row.status as KycStatus,
      targetLevel: row.targetLevel,
      provider: row.provider,
      providerSessionId: row.providerSessionId,
      rejectionReason: row.rejectionReason,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toDomainDocument(row: DocumentDb): DocumentEntity {
    return new DocumentEntity({
      id: row.id,
      verificationId: row.verificationId,
      documentType: row.documentType as DocumentType,
      s3Key: row.s3Key,
      mimeType: row.mimeType,
      fileSizeBytes: row.fileSizeBytes,
      status: row.status,
      createdAt: row.createdAt,
    });
  }

  async create(v: VerificationEntity): Promise<VerificationEntity> {
    const json = v.toJSON();
    const rows = await this.drizzle.db
      .insert(verificationsTable)
      .values({
        id: json.id,
        userId: json.userId,
        status: json.status,
        targetLevel: json.targetLevel,
        provider: json.provider,
        providerSessionId: json.providerSessionId,
        rejectionReason: json.rejectionReason,
        notes: json.notes,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
      })
      .returning();

    return this.toDomainVerification(rows[0]);
  }

  async findById(id: string): Promise<VerificationEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.id, id))
      .limit(1);

    return rows.length > 0 ? this.toDomainVerification(rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<VerificationEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.userId, userId))
      .limit(1);

    return rows.length > 0 ? this.toDomainVerification(rows[0]) : null;
  }

  async findByProviderSessionId(sessionId: string): Promise<VerificationEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(verificationsTable)
      .where(eq(verificationsTable.providerSessionId, sessionId))
      .limit(1);

    return rows.length > 0 ? this.toDomainVerification(rows[0]) : null;
  }

  async update(v: VerificationEntity): Promise<VerificationEntity> {
    const json = v.toJSON();
    const rows = await this.drizzle.db
      .update(verificationsTable)
      .set({
        status: json.status,
        targetLevel: json.targetLevel,
        providerSessionId: json.providerSessionId,
        rejectionReason: json.rejectionReason,
        notes: json.notes,
        updatedAt: new Date(),
      })
      .where(eq(verificationsTable.id, v.id))
      .returning();

    return this.toDomainVerification(rows[0]);
  }

  async addDocument(doc: DocumentEntity): Promise<DocumentEntity> {
    const json = doc.toJSON();
    const rows = await this.drizzle.db
      .insert(documentsTable)
      .values({
        id: json.id,
        verificationId: json.verificationId,
        documentType: json.documentType,
        s3Key: json.s3Key,
        mimeType: json.mimeType,
        fileSizeBytes: json.fileSizeBytes,
        status: json.status,
        createdAt: json.createdAt,
      })
      .returning();

    return this.toDomainDocument(rows[0]);
  }

  async findDocumentsByVerificationId(verificationId: string): Promise<DocumentEntity[]> {
    const rows = await this.drizzle.db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.verificationId, verificationId));

    return rows.map((r) => this.toDomainDocument(r));
  }
}
