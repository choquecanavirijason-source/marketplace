"use client";

import { type ReactNode } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  redirectTo?: string;
  unauthorizedRedirect?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  redirectTo,
  unauthorizedRedirect,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthorized, isChecking } = useRequireAuth({
    roles,
    redirectTo,
    unauthorizedRedirect,
  });

  if (isChecking || !isAuthorized) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-background px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
