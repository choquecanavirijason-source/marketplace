"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/infrastructure/state/authStore";
import type { CurrentUser } from "@/types";
import type {
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  AuthSession,
} from "@/types";

export interface AuthContextValue {
  user: CurrentUser | null;
  token: string | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isUpdatingProfile: boolean;
  isLoggingOut: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  loginOtp?: (credentials: { phone?: string; email?: string; code: string }) => Promise<AuthSession>;
  sendEmailOtp?: (email: string) => Promise<{ message: string; debugOtp?: string }>;
  register: (data: RegisterData) => Promise<AuthSession>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthSession>;
  updateBusinessProfile?: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  logoutAll?: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  return <>{children}</>;
}

export const useAuth = (): AuthContextValue => {
  const store = useAuthStore();

  return {
    user: store.user,
    token: store.token,
    role: store.role,
    permissions: store.permissions,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.isAdmin,
    isSeller: store.isSeller,
    isLoading: !store.isInitialized || store.status === "loading",
    isLoggingIn: store.isLoggingIn,
    isRegistering: store.isRegistering,
    isUpdatingProfile: store.isUpdatingProfile,
    isLoggingOut: store.isLoggingOut,
    login: store.login,
    loginOtp: store.loginOtp,
    sendEmailOtp: store.sendEmailOtp,
    register: store.register,
    updateProfile: store.updateProfile,
    updateBusinessProfile: store.updateBusinessProfile,
    logout: store.logout,
    logoutAll: store.logoutAll,
    refreshUser: store.refreshUser,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
  };
}
