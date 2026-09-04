import { apiRequest } from "@/config/axios";

export interface PublicAuthSettings {
  emailPasswordEnabled: boolean;
  phoneOtpEnabled: boolean;
  socialLoginEnabled: boolean;
  googleAuthEnabled: boolean;
  facebookAuthEnabled: boolean;
  appleAuthEnabled: boolean;
  defaultAuthMethod: "email" | "phone" | "social";
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
}

export interface AdminAuthSettings extends PublicAuthSettings {
  id: string;
  googleClientId?: string | null;
  facebookClientId?: string | null;
  appleClientId?: string | null;
  updatedAt?: string;
}

export interface UpdateAuthSettingsData {
  emailPasswordEnabled?: boolean;
  phoneOtpEnabled?: boolean;
  socialLoginEnabled?: boolean;
  googleAuthEnabled?: boolean;
  googleClientId?: string | null;
  facebookAuthEnabled?: boolean;
  facebookClientId?: string | null;
  appleAuthEnabled?: boolean;
  appleClientId?: string | null;
  defaultAuthMethod?: "email" | "phone" | "social";
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
}

export const getPublicAuthConfig = async (): Promise<PublicAuthSettings> => {
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
};

export const getAdminAuthConfig = async (): Promise<AdminAuthSettings> => {
  const res = await apiRequest<any>("/identity/admin/config", { auth: true });
  return res?.data || res;
};

export const updateAdminAuthConfig = async (
  data: UpdateAuthSettingsData
): Promise<AdminAuthSettings> => {
  const res = await apiRequest<any>("/identity/admin/config", {
    method: "PATCH",
    auth: true,
    body: data,
  });
  return res?.data || res;
};
