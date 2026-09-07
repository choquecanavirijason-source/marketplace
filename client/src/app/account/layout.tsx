"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout, customerNavItems } from "@/components/layout/DashboardLayout";

interface AccountLayoutProps {
  children: ReactNode;
}

const AUTH_PATHS = [
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/verify-email",
];

export const AccountLayout = ({ children }: AccountLayoutProps) => {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute redirectTo="/account/login">
      <DashboardLayout navItems={customerNavItems} title="Mi Cuenta">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AccountLayout;
