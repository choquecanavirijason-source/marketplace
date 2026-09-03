import { create } from "zustand";
import { container } from "@/infrastructure/container";
import {
  getAuthToken,
  getCurrentUser,
  getAuthPermissions,
  logoutCustomer,
} from "@/shared/lib/marketplaceStorage";
import { mergeCartWithServer } from "@/infrastructure/cartSync";
import { normalizePermission } from "@/infrastructure/auth/permissions";
import type {
  CurrentUser,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  AuthSession,
} from "@/types";

export interface AuthState {
  user: CurrentUser | null;
  token: string | null;
  permissions: string[];
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  isLoggingIn: boolean;
  isRegistering: boolean;
  isUpdatingProfile: boolean;
  isLoggingOut: boolean;
  isInitialized: boolean;

  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSeller: boolean;
  role: string | null;

  init: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  loginOtp: (credentials: { phone?: string; email?: string; code: string }) => Promise<AuthSession>;
  sendEmailOtp: (email: string) => Promise<{ message: string; debugOtp?: string }>;
  register: (data: RegisterData) => Promise<AuthSession>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthSession>;
  updateBusinessProfile: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

function computeRoles(user: CurrentUser | null) {
  const role = (user?.type ?? user?.roleName ?? "").toLowerCase() || null;
  const userRoles = (user?.roles ?? []).map((r) => r.toLowerCase());
  const isSuperAdmin = role === "superadmin" || userRoles.includes("superadmin");
  const isAdmin =
    isSuperAdmin ||
    role === "admin" ||
    role === "support" ||
    role === "staff" ||
    userRoles.includes("admin");
  const isSeller =
    role === "seller" ||
    role === "seller_individual" ||
    role === "seller_empresa" ||
    userRoles.includes("seller") ||
    userRoles.includes("seller_individual") ||
    userRoles.includes("seller_empresa");

  return {
    role,
    isAdmin,
    isSuperAdmin,
    isSeller,
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  permissions: [],
  status: "idle",
  isLoggingIn: false,
  isRegistering: false,
  isUpdatingProfile: false,
  isLoggingOut: false,
  isInitialized: false,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  isSeller: false,
  role: null,

  init: async () => {
    if (typeof window === "undefined") return;
    const token = getAuthToken();
    const storedUser = getCurrentUser();
    const storedPermissions = getAuthPermissions();

    if (!token) {
      set({
        user: null,
        token: null,
        permissions: [],
        status: "unauthenticated",
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false,
        isSeller: false,
        role: null,
        isInitialized: true,
      });
      return;
    }

    const initialComputed = computeRoles(storedUser);
    set({
      user: storedUser,
      token,
      permissions: storedPermissions,
      status: storedUser ? "authenticated" : "loading",
      isAuthenticated: Boolean(storedUser),
      isAdmin: initialComputed.isAdmin,
      isSuperAdmin: initialComputed.isSuperAdmin,
      isSeller: initialComputed.isSeller,
      role: initialComputed.role,
      isInitialized: Boolean(storedUser),
    });

    try {
      const session = await container.getSession.execute();
      const freshComputed = computeRoles(session.user);
      set({
        user: session.user,
        token: session.accessToken || token,
        permissions: session.permissions,
        status: "authenticated",
        isAuthenticated: true,
        isAdmin: freshComputed.isAdmin,
        isSuperAdmin: freshComputed.isSuperAdmin,
        isSeller: freshComputed.isSeller,
        role: freshComputed.role,
        isInitialized: true,
      });
    } catch {
      if (!storedUser) {
        logoutCustomer();
        set({
          user: null,
          token: null,
          permissions: [],
          status: "unauthenticated",
          isAuthenticated: false,
          isAdmin: false,
          isSuperAdmin: false,
          isSeller: false,
          role: null,
          isInitialized: true,
        });
      }
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoggingIn: true });
    try {
      const session = await container.login.execute(credentials);
      const computed = computeRoles(session.user);
      set({
        user: session.user,
        token: session.accessToken,
        permissions: session.permissions,
        status: "authenticated",
        isAuthenticated: true,
        isAdmin: computed.isAdmin,
        isSuperAdmin: computed.isSuperAdmin,
        isSeller: computed.isSeller,
        role: computed.role,
        isLoggingIn: false,
        isInitialized: true,
      });
      void mergeCartWithServer();
      return session;
    } catch (err) {
      set({ isLoggingIn: false });
      throw err;
    }
  },

  loginOtp: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      if (!container.auth.loginOtp) throw new Error("loginOtp no implementado");
      const session = await container.auth.loginOtp(credentials);
      const computed = computeRoles(session.user);
      set({
        user: session.user,
        token: session.accessToken,
        permissions: session.permissions,
        status: "authenticated",
        isAuthenticated: true,
        isAdmin: computed.isAdmin,
        isSuperAdmin: computed.isSuperAdmin,
        isSeller: computed.isSeller,
        role: computed.role,
        isLoggingIn: false,
        isInitialized: true,
      });
      void mergeCartWithServer();
      return session;
    } catch (err) {
      set({ isLoggingIn: false });
      throw err;
    }
  },

  sendEmailOtp: async (email: string) => {
    if (!container.auth.sendEmailOtp) {
      throw new Error("sendEmailOtp no implementado");
    }
    return container.auth.sendEmailOtp(email);
  },

  register: async (data: RegisterData) => {
    set({ isRegistering: true });
    try {
      const session = await container.register.execute(data);
      const computed = computeRoles(session.user);
      set({
        user: session.user,
        token: session.accessToken,
        permissions: session.permissions,
        status: "authenticated",
        isAuthenticated: true,
        isAdmin: computed.isAdmin,
        isSuperAdmin: computed.isSuperAdmin,
        isSeller: computed.isSeller,
        role: computed.role,
        isRegistering: false,
        isInitialized: true,
      });
      void mergeCartWithServer();
      return session;
    } catch (err) {
      set({ isRegistering: false });
      throw err;
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    set({ isUpdatingProfile: true });
    try {
      const session = await container.updateProfile.execute(data);
      const computed = computeRoles(session.user);
      set({
        user: session.user,
        token: session.accessToken || get().token,
        permissions: session.permissions,
        isAdmin: computed.isAdmin,
        isSuperAdmin: computed.isSuperAdmin,
        isSeller: computed.isSeller,
        role: computed.role,
        isUpdatingProfile: false,
      });
      return session;
    } catch (err) {
      set({ isUpdatingProfile: false });
      throw err;
    }
  },

  updateBusinessProfile: async (data: any) => {
    set({ isUpdatingProfile: true });
    try {
      if (!container.auth.updateBusinessProfile) throw new Error("updateBusinessProfile no implementado");
      const response = await container.auth.updateBusinessProfile(data);
      await get().refreshUser();
      set({ isUpdatingProfile: false });
      return response;
    } catch (err) {
      set({ isUpdatingProfile: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await container.logout.execute();
    } catch {
    } finally {
      logoutCustomer();
      set({
        user: null,
        token: null,
        permissions: [],
        status: "unauthenticated",
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false,
        isSeller: false,
        role: null,
        isLoggingOut: false,
        isInitialized: true,
      });
    }
  },

  logoutAll: async () => {
    set({ isLoggingOut: true });
    try {
      if (container.auth.logoutAll) {
        await container.auth.logoutAll();
      }
    } catch {
    } finally {
      logoutCustomer();
      set({
        user: null,
        token: null,
        permissions: [],
        status: "unauthenticated",
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false,
        isSeller: false,
        role: null,
        isLoggingOut: false,
        isInitialized: true,
      });
    }
  },

  refreshUser: async () => {
    try {
      const session = await container.getSession.execute();
      const computed = computeRoles(session.user);
      set({
        user: session.user,
        permissions: session.permissions,
        status: "authenticated",
        isAuthenticated: true,
        isAdmin: computed.isAdmin,
        isSuperAdmin: computed.isSuperAdmin,
        isSeller: computed.isSeller,
        role: computed.role,
      });
    } catch {
    }
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    const currentRole = (user.type ?? user.roleName ?? "").toLowerCase();
    const userRoles = (user.roles ?? []).map((r) => r.toLowerCase());
    const target = role.toLowerCase();
    return currentRole === target || userRoles.includes(target);
  },

  hasAnyRole: (rolesList: string[]) => {
    return rolesList.some((r) => get().hasRole(r));
  },

  hasPermission: (permission: string) => {
    const { permissions, user } = get();
    if (!user) return false;
    const currentRole = (user.type ?? user.roleName ?? "").toLowerCase();
    const userRoles = (user.roles ?? []).map((r) => r.toLowerCase());
    if (currentRole === "superadmin" || userRoles.includes("superadmin") || permissions.includes("*")) {
      return true;
    }
    const target = normalizePermission(permission);
    return permissions.includes(target) || permissions.includes(permission);
  },

  hasAnyPermission: (permList: string[]) => {
    return permList.some((p) => get().hasPermission(p));
  },

  hasAllPermissions: (permList: string[]) => {
    return permList.every((p) => get().hasPermission(p));
  },
}));
