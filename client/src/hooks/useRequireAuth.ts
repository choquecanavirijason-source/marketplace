"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/infrastructure/state/authStore";

interface UseRequireAuthOptions {
  roles?: string[];
  redirectTo?: string;
  unauthorizedRedirect?: string;
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const hasRole = useAuthStore((s) => s.hasRole);
  const role = useAuthStore((s) => s.role);

  const { roles, redirectTo = "/account/login", unauthorizedRedirect = "/" } = options;

  const hasRequiredRole = !roles || roles.length === 0 || roles.some((r) => hasRole(r));
  const isAuthorized = isInitialized && isAuthenticated && hasRequiredRole;
  const isChecking = !isInitialized;

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      const target = `${redirectTo}?redirect=${encodeURIComponent(pathname || "/")}`;
      router.push(target);
      return;
    }

    if (!hasRequiredRole) {
      router.push(unauthorizedRedirect);
    }
  }, [isInitialized, isAuthenticated, hasRequiredRole, router, pathname, redirectTo, unauthorizedRedirect]);

  return {
    isAuthorized,
    isChecking,
    user,
    role,
    isAuthenticated,
  };
}
