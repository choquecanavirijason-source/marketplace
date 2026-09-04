import { apiRequest } from "@/config/axios";
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  OtpLoginCredentials,
  RegisterData,
  UpdateProfileData,
  UpdateBusinessProfileData,
  UserSessionItem,
  UserAuditEvent,
} from "@/types";
import {
  logoutCustomer,
  setAuthToken,
  setRefreshToken,
  setCurrentUser,
  setSession,
  setAuthPermissions,
} from "@/shared/lib/marketplaceStorage";

export type {
  AuthUser,
  AuthSession,
  LoginCredentials,
  OtpLoginCredentials,
  RegisterData,
  UpdateProfileData,
  UpdateBusinessProfileData,
  UserSessionItem,
  UserAuditEvent,
};

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  loginOtp?(credentials: OtpLoginCredentials): Promise<AuthSession>;
  sendEmailOtp?(email: string): Promise<{ message: string; debugOtp?: string }>;
  register(data: RegisterData): Promise<AuthSession>;
  me(): Promise<AuthSession>;
  updateProfile(data: UpdateProfileData): Promise<AuthSession>;
  updateBusinessProfile?(data: UpdateBusinessProfileData): Promise<any>;
  getSessions?(): Promise<UserSessionItem[]>;
  revokeSession?(sessionId: string): Promise<void>;
  forgotPassword?(email: string): Promise<{ message: string }>;
  resetPassword?(token: string, password: string): Promise<{ success: boolean; message: string }>;
  verifyEmail?(email: string, token: string): Promise<{ success: boolean; message: string }>;
  sendPhoneOtp?(phone: string): Promise<{ message: string; debugOtp?: string }>;
  verifyPhoneOtp?(phone: string, code: string): Promise<{ success: boolean; message: string }>;
  phoneLogin?(phone: string, code: string): Promise<AuthSession>;
  socialLogin?(data: { provider: "google" | "facebook" | "apple"; email: string; firstName?: string; lastName?: string; avatarUrl?: string; token?: string }): Promise<AuthSession>;
  logout(): Promise<void>;
}

export type AuthRepository = AuthService;

interface ApiUser {
  id: number | string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  mobile_number?: string | null;
  mobileNumber?: string | null;
  address?: string | null;
  role?: string | null;
  role_name?: string | null;
  roleName?: string | null;
  type?: string | null;
  status?: string | null;
  roles?: string[];
  completionPct?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface ApiAuthPayload {
  data?: {
    access_token?: string;
    accessToken?: string;
    expires_at?: string | null;
    expiresAt?: string | null;
    user: ApiUser;
    permissions?: string[];
  };
  accessToken?: string;
  access_token?: string;
  expiresAt?: string | null;
  expires_at?: string | null;
  user?: ApiUser;
  permissions?: string[];
}

const mapUser = (u?: any): AuthUser => {
  if (!u) {
    return {
      id: "",
      name: "Usuario",
      email: "",
      role: "buyer",
      roleName: "buyer",
      roles: ["buyer"],
    };
  }

  const roleResolved = (u.role || u.role_name || u.roleName || (u.roles && u.roles[0]) || u.type || "buyer").toLowerCase();

  const displayName =
    u.name ||
    u.fullName ||
    (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName || u.email || "Usuario");

  return {
    id: u.id || "",
    name: displayName,
    email: u.email || "",
    mobileNumber: u.mobile_number || u.mobileNumber || u.phone || null,
    phone: u.phone || u.mobileNumber || null,
    address: u.address || null,
    role: roleResolved,
    roleName: roleResolved,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl || u.profile?.avatarUrl || null,
    type: u.type || roleResolved,
    status: u.status,
    roles: u.roles || (u.role ? [u.role] : [roleResolved]),
    country: u.country || u.profile?.country || null,
    phoneCountry: u.phoneCountry || u.profile?.phoneCountry || null,
    completionPct: typeof u.completionPct === 'number' ? u.completionPct : (u.profile?.completionPct ?? 20),
    emailVerified: Boolean(u.emailVerified || u.emailVerifiedAt),
    phoneVerified: Boolean(u.phoneVerified || u.phoneVerifiedAt),
    businessProfile: u.businessProfile || null,
  };
};

const mapSession = (payload: any): AuthSession => {
  const rawData = payload?.data || payload || {};
  const token = rawData.accessToken || rawData.access_token || payload.accessToken || payload.access_token || "";
  const refreshToken = rawData.refreshToken || rawData.refresh_token || payload.refreshToken || payload.refresh_token || undefined;
  const expiresAt = rawData.expiresAt || rawData.expires_at || null;
  const rawUser = rawData.user || (rawData.email || rawData.id ? rawData : payload.user);
  const permissions = rawData.permissions || payload.permissions || rawUser?.permissions || [];

  return {
    accessToken: token,
    refreshToken,
    expiresAt,
    user: mapUser(rawUser),
    permissions,
  };
};

export class HttpAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/login", {
      method: "POST",
      body: credentials,
    });

    const session = mapSession(payload);
    setSession(session.user, session.accessToken, session.permissions, session.refreshToken);
    setAuthPermissions(session.permissions);
    return session;
  }

  async loginOtp(credentials: OtpLoginCredentials): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/otp/login", {
      method: "POST",
      body: credentials,
    });

    const session = mapSession(payload);
    setSession(session.user, session.accessToken, session.permissions, session.refreshToken);
    setAuthPermissions(session.permissions);
    return session;
  }

  async sendEmailOtp(email: string): Promise<{ message: string; debugOtp?: string }> {
    return apiRequest("/identity/otp/send-email", {
      method: "POST",
      body: { email },
    });
  }

  async register(data: RegisterData): Promise<AuthSession> {
    const rawName = (data.name || `${data.firstName || ""} ${data.lastName || ""}`).trim();
    const parts = rawName.split(" ").filter(Boolean);
    const firstName = data.firstName || parts[0] || "Usuario";
    const lastName = data.lastName || parts.slice(1).join(" ") || "Registrado";
    const phone = data.phone || data.mobileNumber;

    const payload = await apiRequest<any>("/identity/register", {
      method: "POST",
      body: {
        name: rawName,
        firstName,
        lastName,
        email: data.email,
        password: data.password,
        phone,
        mobileNumber: phone,
        address: data.address,
        type: data.type,
        legalName: data.legalName,
        tradeName: data.tradeName,
        taxId: data.taxId,
        legalType: data.legalType,
        fiscalAddress: data.fiscalAddress,
        termsAccepted: data.termsAccepted,
      },
    });

    const session = mapSession(payload);

    if (!session.accessToken && data.email && data.password) {
      try {
        return await this.login({ email: data.email, password: data.password });
      } catch {
      }
    }

    setSession(session.user, session.accessToken, session.permissions, session.refreshToken);
    setAuthPermissions(session.permissions);
    return session;
  }

  async me(): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/me", { auth: true });
    const session = mapSession(payload);
    setCurrentUser(session.user);
    if (session.accessToken && session.accessToken.trim() !== "") {
      setAuthToken(session.accessToken);
    }
    if (session.permissions && session.permissions.length > 0) {
      setAuthPermissions(session.permissions);
    }
    return session;
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/profile", {
      method: "PUT",
      auth: true,
      body: data,
    });

    const session = mapSession(payload);
    setCurrentUser(session.user);
    return session;
  }

  async updateBusinessProfile(data: UpdateBusinessProfileData): Promise<any> {
    return apiRequest("/identity/business-profile", {
      method: "PUT",
      auth: true,
      body: data,
    });
  }

  async getSessions(): Promise<UserSessionItem[]> {
    const res = await apiRequest<any>("/identity/sessions", { auth: true });
    const items = res?.data || res;
    return Array.isArray(items) ? items : [];
  }

  async revokeSession(sessionId: string): Promise<void> {
    await apiRequest(`/identity/sessions/${sessionId}`, {
      method: "DELETE",
      auth: true,
    });
  }

  async logoutAll(): Promise<void> {
    try {
      await apiRequest("/identity/logout-all", { method: "POST", auth: true });
    } finally {
      setAuthToken(null);
      setRefreshToken(null);
      setAuthPermissions([]);
      logoutCustomer();
    }
  }

  async logout(): Promise<void> {
    try {
      await apiRequest("/identity/logout", { method: "POST", auth: true });
    } catch {
    } finally {
      setAuthToken(null);
      setRefreshToken(null);
      setAuthPermissions([]);
      logoutCustomer();
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiRequest("/identity/forgot-password", {
      method: "POST",
      body: { email },
    });
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    return apiRequest("/identity/reset-password", {
      method: "POST",
      body: { token, password },
    });
  }

  async verifyEmail(email: string, token: string): Promise<{ success: boolean; message: string }> {
    return apiRequest("/identity/verify-email", {
      method: "POST",
      body: { email, token },
    });
  }

  async sendPhoneOtp(phone: string): Promise<{ message: string; debugOtp?: string }> {
    return apiRequest("/identity/otp/send-phone", {
      method: "POST",
      body: { phone },
    });
  }

  async verifyPhoneOtp(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    return apiRequest("/identity/otp/verify-phone", {
      method: "POST",
      body: { phone, code },
    });
  }

  async phoneLogin(phone: string, code: string): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/phone/login", {
      method: "POST",
      body: { phone, code },
    });
    const session = mapSession(payload);
    setSession(session.user, session.accessToken, session.permissions, session.refreshToken);
    setAuthPermissions(session.permissions);
    return session;
  }

  async socialLogin(data: { provider: "google" | "facebook" | "apple"; email: string; firstName?: string; lastName?: string; avatarUrl?: string; token?: string }): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/social/login", {
      method: "POST",
      body: data,
    });
    const session = mapSession(payload);
    setSession(session.user, session.accessToken, session.permissions, session.refreshToken);
    setAuthPermissions(session.permissions);
    return session;
  }
}

export const HttpAuthRepository = HttpAuthService;

