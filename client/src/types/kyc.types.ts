export interface KycChallenge {
  challenge: 'blink_twice' | 'blink_once' | 'turn_head' | 'none';
  instruction: string;
  nonce: string;
  expires_at: string;
}

export interface SubmitKycPayload {
  idImage: string;
  idImageMimeType?: string;
  selfieVideo: string;
  selfieVideoMimeType?: string;
  challenge: string;
  nonce: string;
  documentType?: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE';
}

export interface KycSubmissionResult {
  verificationId: string;
  jobId: string;
  status: 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'REVIEW_NEEDED';
  message: string;
}

export interface KycStatusResult {
  verificationId?: string;
  jobId?: string;
  status: 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'REVIEW_NEEDED';
  kycLevel: number;
  decision?: 'APPROVE' | 'REVIEW' | 'REJECT' | null;
  similarity?: number | null;
  livenessScore?: number | null;
  rejectionReason?: string | null;
  isVerified: boolean;
}
