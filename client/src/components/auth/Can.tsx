"use client";

import { type ReactNode } from "react";
import { usePrivileges } from "@/hooks/usePrivileges";

interface CanProps {
  permission?: string | string[];
  role?: string | string[];
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({
  permission,
  role,
  anyOf,
  allOf,
  fallback = null,
  children,
}: CanProps) {
  const { can, hasRole, hasAnyRole, hasAllPermissions, hasAnyPermission } = usePrivileges();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (role) {
    if (Array.isArray(role)) {
      if (!hasAnyRole(role)) return <>{fallback}</>;
    } else if (!hasRole(role)) {
      return <>{fallback}</>;
    }
  }

  if (anyOf && anyOf.length > 0 && !hasAnyPermission(anyOf)) {
    return <>{fallback}</>;
  }

  if (allOf && allOf.length > 0 && !hasAllPermissions(allOf)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
