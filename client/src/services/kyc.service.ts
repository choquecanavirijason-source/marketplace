import { apiRequest } from "@/config/axios";
import type {
  KycChallenge,
  SubmitKycPayload,
  KycSubmissionResult,
  KycStatusResult,
} from "@/types";

export class KycService {
  async getChallenge(): Promise<KycChallenge> {
    return apiRequest<KycChallenge>("/kyc/challenge", {
      method: "GET",
    });
  }

  async submitVerification(data: SubmitKycPayload): Promise<KycSubmissionResult> {
    return apiRequest<KycSubmissionResult>("/kyc/submit", {
      method: "POST",
      auth: true,
      body: data,
    });
  }

  async getStatus(jobId?: string): Promise<KycStatusResult> {
    const query = jobId ? `?jobId=${encodeURIComponent(jobId)}` : "";
    return apiRequest<KycStatusResult>(`/kyc/status${query}`, {
      method: "GET",
      auth: true,
    });
  }
}

export const kycService = new KycService();
