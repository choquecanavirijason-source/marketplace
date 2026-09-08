"use client";

import { useAuthStore } from "@/context/authStore";

export const usePrivileges = () => {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const permissions = useAuthStore((s) => s.permissions);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const isSeller = useAuthStore((s) => s.isSeller);

  const hasRole = useAuthStore((s) => s.hasRole);
  const hasAnyRole = useAuthStore((s) => s.hasAnyRole);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);
  const hasAllPermissions = useAuthStore((s) => s.hasAllPermissions);

  const can = (permissionOrList: string | string[]): boolean => {
    if (Array.isArray(permissionOrList)) {
      return hasAnyPermission(permissionOrList);
    }
    return hasPermission(permissionOrList);
  };

  return {
    user,
    role,
    permissions,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isSeller,
    can,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
