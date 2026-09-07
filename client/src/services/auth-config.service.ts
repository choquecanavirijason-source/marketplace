import { apiRequest } from "@/config/axios";
import type { PublicAuthSettings, AdminAuthSettings, UpdateAuthSettingsData } from "@/types";

export class AuthConfigService {
  async getPublicAuthConfig(): Promise<PublicAuthSettings> {
    const res = await apiRequest<any>("/identity/config");
    const data = res?.data || res;
    return {
      emailPasswordEnabled: data?.emailPasswordEnabled ?? true,
      phoneOtpEnabled: data?.phoneOtpEnabled ?? true,
      socialLoginEnabled: data?.socialLoginEnabled ?? true,
      googleAuthEnabled: data?.googleAuthEnabled ?? true,
      facebookAuthEnabled: data?.facebookAuthEnabled ?? true,
      appleAuthEnabled: data?.appleAuthEnabled ?? true,
      defaultAuthMethod: (data?.defaultAuthMethod as "email" | "phone" | "social") ?? "email",
      requireEmailVerification: data?.requireEmailVerification ?? false,
      requirePhoneVerification: data?.requirePhoneVerification ?? false,
    };
  }

  async getAdminAuthConfig(): Promise<AdminAuthSettings> {
    const res = await apiRequest<any>("/identity/admin/config", { auth: true });
    return res?.data || res;
  }

  async updateAdminAuthConfig(data: UpdateAuthSettingsData): Promise<AdminAuthSettings> {
    const res = await apiRequest<any>("/identity/admin/config", {
      method: "PATCH",
      auth: true,
      body: data,
    });
    return res?.data || res;
  }
}

export const authConfigService = new AuthConfigService();

export const getPublicAuthConfig = () => authConfigService.getPublicAuthConfig();
export const getAdminAuthConfig = () => authConfigService.getAdminAuthConfig();
export const updateAdminAuthConfig = (data: UpdateAuthSettingsData) => authConfigService.updateAdminAuthConfig(data);
