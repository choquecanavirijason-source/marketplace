import { apiRequest, ApiError } from "@/config/axios";
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
  logoutAll?(): Promise<void>;
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

const mapUser = (u: ApiUser): AuthUser => {
  const displayName =
    u.name ||
    u.fullName ||
    (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName || u.email);

  return {
    id: u.id,
    name: displayName,
    email: u.email,
    mobileNumber: u.mobile_number || u.mobileNumber || u.phone || null,
    address: u.address || null,
    roleName: u.role_name || u.roleName || u.role || (u.roles && u.roles[0]) || "buyer",
    firstName: u.firstName,
    lastName: u.lastName,
    type: u.type,
    status: u.status,
    roles: u.roles || (u.role ? [u.role] : []),
    completionPct: u.completionPct,
    emailVerified: u.emailVerified,
    phoneVerified: u.phoneVerified,
  };
};

const mapSession = (payload: ApiAuthPayload): AuthSession => {
  const rawData = payload.data || payload;
  const token = rawData.accessToken || rawData.access_token || "";
  const expiresAt = rawData.expiresAt || rawData.expires_at || null;
  const rawUser = rawData.user || (payload.user as ApiUser);
  const permissions = rawData.permissions || payload.permissions || [];

  return {
    accessToken: token,
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
    setSession(session.user, session.accessToken);
    setAuthPermissions(session.permissions);
    return session;
  }

  async loginOtp(credentials: OtpLoginCredentials): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/otp/login", {
      method: "POST",
      body: credentials,
    });

    const session = mapSession(payload);
    setSession(session.user, session.accessToken);
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
    const payload = await apiRequest<ApiAuthPayload>("/identity/register", {
      method: "POST",
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        mobileNumber: data.mobileNumber,
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
    setSession(session.user, session.accessToken);
    setAuthPermissions(session.permissions);
    return session;
  }

  async me(): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/identity/me", { auth: true });
    const session = mapSession(payload);
    setSession(session.user, session.accessToken);
    setAuthPermissions(session.permissions);
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
    return apiRequest<UserSessionItem[]>("/identity/sessions", { auth: true });
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
      setAuthPermissions([]);
      logoutCustomer();
    }
  }
}

export const HttpAuthRepository = HttpAuthService;
