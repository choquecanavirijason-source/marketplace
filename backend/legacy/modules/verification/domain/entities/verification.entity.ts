import { KycStatus, InvalidStateTransitionException } from '../../../../shared';

export interface VerificationProps {
  id: string;
  userId: string;
  status: KycStatus;
  targetLevel: number;
  provider: string;
  providerSessionId?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class VerificationEntity {
  private props: VerificationProps;

  constructor(props: VerificationProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get status(): KycStatus { return this.props.status; }
  get targetLevel(): number { return this.props.targetLevel; }
  get provider(): string { return this.props.provider; }
  get providerSessionId(): string | null | undefined { return this.props.providerSessionId; }
  get rejectionReason(): string | null | undefined { return this.props.rejectionReason; }
  get notes(): string | null | undefined { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  submitDocuments() {
    if (this.props.status !== KycStatus.DRAFT && this.props.status !== KycStatus.ACTION_REQUIRED) {
      throw new InvalidStateTransitionException('Verification', this.props.status, KycStatus.PENDING_DOCS);
    }
    this.props.status = KycStatus.PENDING_DOCS;
    this.props.updatedAt = new Date();
  }

  markProcessing(providerSessionId?: string) {
    if (this.props.status !== KycStatus.PENDING_DOCS && this.props.status !== KycStatus.DRAFT) {
      throw new InvalidStateTransitionException('Verification', this.props.status, KycStatus.PROCESSING);
    }
    this.props.status = KycStatus.PROCESSING;
    if (providerSessionId) this.props.providerSessionId = providerSessionId;
    this.props.updatedAt = new Date();
  }

  approve() {
    if (this.props.status !== KycStatus.PROCESSING && this.props.status !== KycStatus.REVIEW_NEEDED) {
      throw new InvalidStateTransitionException('Verification', this.props.status, KycStatus.APPROVED);
    }
    this.props.status = KycStatus.APPROVED;
    this.props.rejectionReason = null;
    this.props.updatedAt = new Date();
  }

  reject(reason: string) {
    this.props.status = KycStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.props.updatedAt = new Date();
  }

  requestReview(notes?: string) {
    this.props.status = KycStatus.REVIEW_NEEDED;
    if (notes) this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      status: this.status,
      targetLevel: this.targetLevel,
      provider: this.provider,
      providerSessionId: this.providerSessionId,
      rejectionReason: this.rejectionReason,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
