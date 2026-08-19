import { apiRequest } from "@/infrastructure/http/client";
import type {
  AuthRepository,
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
} from "@/domain/repositories/AuthRepository";
import {
  logoutCustomer,
  setAuthToken,
  setCurrentUser,
  setSession,
} from "@/shared/lib/marketplaceStorage";

interface ApiUser {
  id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  address: string | null;
  role_name: string | null;
}

interface ApiAuthPayload {
  data: {
    access_token: string;
    expires_at: string | null;
    user: ApiUser;
    permissions: string[];
  };
}

function mapUser(u: ApiUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    mobileNumber: u.mobile_number,
    address: u.address,
    roleName: u.role_name,
  };
}

function mapSession(payload: ApiAuthPayload): AuthSession {
  return {
    accessToken: payload.data.access_token,
    expiresAt: payload.data.expires_at,
    user: mapUser(payload.data.user),
    permissions: payload.data.permissions,
  };
}

export class HttpAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/login", {
      method: "POST",
      body: credentials,
    });

    const session = mapSession(payload);
    setSession(session.user, session.accessToken);
    return session;
  }

  async register(data: RegisterData): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/register", {
      method: "POST",
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        mobile_number: data.mobileNumber,
        address: data.address,
      },
    });

    const session = mapSession(payload);
    setSession(session.user, session.accessToken);
    return session;
  }

  async me(): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/me", { auth: true });
    return mapSession(payload);
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthPayload>("/me", {
      method: "PUT",
      auth: true,
      body: {
        name: data.name,
        mobile_number: data.mobileNumber,
        address: data.address,
        password: data.password,
        password_confirmation: data.password,
      },
    });

    const session = mapSession(payload);
    setCurrentUser(session.user);
    return session;
  }

  async logout(): Promise<void> {
    try {
      await apiRequest("/logout", { method: "POST", auth: true });
    } catch {
      // la sesión local se limpia igualmente
    } finally {
      setAuthToken(null);
      logoutCustomer();
    }
  }
}