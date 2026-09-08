"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/context/authStore";
import { syncAuthCookies } from "@/shared/lib/marketplaceStorage";
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
  hasSellerProfile: boolean;
  hasBusinessProfile: boolean;
  activeMode: import("@/shared/lib/marketplaceStorage").DashboardMode;
  setActiveMode: (mode: import("@/shared/lib/marketplaceStorage").DashboardMode) => void;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isUpdatingProfile: boolean;
  isLoggingOut: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  loginOtp?: (credentials: { phone?: string; email?: string; code: string }) => Promise<AuthSession>;
  phoneLogin?: (phone: string, code: string) => Promise<AuthSession>;
  socialLogin?: (data: { provider: "google" | "facebook" | "apple"; email: string; firstName?: string; lastName?: string; avatarUrl?: string; token?: string }) => Promise<AuthSession>;
  sendEmailOtp?: (email: string) => Promise<{ message: string; debugOtp?: string }>;
  register: (data: RegisterData) => Promise<AuthSession>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthSession>;
  updateBusinessProfile?: (data: any) => Promise<any>;
  setSellerProfile?: (profile: any) => void;
  logout: () => Promise<void>;
  logoutAll?: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    syncAuthCookies();
    useAuthStore.getState().init();
  }, []);

  return <>{children}</>;
};

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
    hasSellerProfile: store.hasSellerProfile,
    hasBusinessProfile: store.hasBusinessProfile,
    activeMode: store.activeMode,
    setActiveMode: store.setActiveMode,
    isLoading: !store.isInitialized || store.status === "loading",
    isLoggingIn: store.isLoggingIn,
    isRegistering: store.isRegistering,
    isUpdatingProfile: store.isUpdatingProfile,
    isLoggingOut: store.isLoggingOut,
    login: store.login,
    loginOtp: store.loginOtp,
    phoneLogin: store.phoneLogin,
    socialLogin: store.socialLogin,
    sendEmailOtp: store.sendEmailOtp,
    register: store.register,
    updateProfile: store.updateProfile,
    updateBusinessProfile: store.updateBusinessProfile,
    setSellerProfile: store.setSellerProfile,
    logout: store.logout,
    logoutAll: store.logoutAll,
    refreshUser: store.refreshUser,
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
  };
};
