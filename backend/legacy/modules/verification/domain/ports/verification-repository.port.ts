import { VerificationEntity } from '../entities/verification.entity';
import { DocumentEntity } from '../entities/document.entity';

export abstract class VerificationRepositoryPort {
  abstract create(verification: VerificationEntity): Promise<VerificationEntity>;
  abstract findById(id: string): Promise<VerificationEntity | null>;
  abstract findByUserId(userId: string): Promise<VerificationEntity | null>;
  abstract findByProviderSessionId(sessionId: string): Promise<VerificationEntity | null>;
  abstract update(verification: VerificationEntity): Promise<VerificationEntity>;
  abstract addDocument(doc: DocumentEntity): Promise<DocumentEntity>;
  abstract findDocumentsByVerificationId(verificationId: string): Promise<DocumentEntity[]>;
}
