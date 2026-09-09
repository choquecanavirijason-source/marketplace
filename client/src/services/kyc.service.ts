import { apiRequest } from "@/config/axios";
import type {
  KycChallenge,
  SubmitKycPayload,
  KycSubmissionResult,
  KycStatusResult,
} from "@/types";

export class KycService {
  async getChallenge(): Promise<KycChallenge> {
    const res = await apiRequest<any>("/kyc/challenge", {
      method: "GET",
    });
    return res?.data ?? res;
  }

  async submitVerification(data: SubmitKycPayload): Promise<KycSubmissionResult> {
    const res = await apiRequest<any>("/kyc/submit", {
      method: "POST",
      auth: true,
      body: data,
    });
    return res?.data ?? res;
  }

  async getStatus(jobId?: string): Promise<KycStatusResult> {
    const query = jobId ? `?jobId=${encodeURIComponent(jobId)}` : "";
    const res = await apiRequest<any>(`/kyc/status${query}`, {
      method: "GET",
      auth: true,
    });
    return res?.data ?? res;
  }
}

export const kycService = new KycService();
