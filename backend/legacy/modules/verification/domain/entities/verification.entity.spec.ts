import { VerificationEntity } from './verification.entity';
import { KycStatus, InvalidStateTransitionException } from '../../../../shared';

describe('VerificationEntity State Machine', () => {
  let verification: VerificationEntity;

  beforeEach(() => {
    verification = new VerificationEntity({
      id: 'test-id',
      userId: 'user-id',
      status: KycStatus.DRAFT,
      targetLevel: 1,
      provider: 'TEST_PROVIDER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should transition from DRAFT to PENDING_DOCS', () => {
    verification.submitDocuments();
    expect(verification.status).toBe(KycStatus.PENDING_DOCS);
  });

  it('should transition from PENDING_DOCS to PROCESSING', () => {
    verification.submitDocuments();
    verification.markProcessing('session-123');
    expect(verification.status).toBe(KycStatus.PROCESSING);
    expect(verification.providerSessionId).toBe('session-123');
  });

  it('should transition from PROCESSING to APPROVED', () => {
    verification.submitDocuments();
    verification.markProcessing();
    verification.approve();
    expect(verification.status).toBe(KycStatus.APPROVED);
  });

  it('should reject invalid transition from DRAFT directly to APPROVED', () => {
    expect(() => verification.approve()).toThrow(InvalidStateTransitionException);
  });
});
