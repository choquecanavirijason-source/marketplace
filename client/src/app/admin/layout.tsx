"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout, adminNavItems } from "@/components/layout/DashboardLayout";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <ProtectedRoute
      roles={["admin", "superadmin"]}
      redirectTo="/account/login?redirect=/admin"
    >
      <DashboardLayout navItems={adminNavItems} title="Panel administrador">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminLayout;
