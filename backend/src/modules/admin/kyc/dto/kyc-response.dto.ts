import { KycStatus } from '../../../../shared';

export interface KycSubmissionResponse {
  verificationId: string;
  jobId: string;
  status: KycStatus;
  message: string;
}

export interface KycStatusResponse {
  verificationId?: string;
  jobId?: string;
  status: KycStatus;
  kycLevel: number;
  decision?: 'APPROVE' | 'REVIEW' | 'REJECT' | null;
  similarity?: number | null;
  livenessScore?: number | null;
  rejectionReason?: string | null;
  isVerified: boolean;
}
