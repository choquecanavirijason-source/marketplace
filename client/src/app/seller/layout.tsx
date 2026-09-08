"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout, sellerNavItems } from "@/components/dashboard/DashboardLayout";

interface SellerLayoutProps {
  children: ReactNode;
}

export const SellerLayout = ({ children }: SellerLayoutProps) => {
  return (
    <ProtectedRoute redirectTo="/account/login?redirect=/seller/dashboard">
      <DashboardLayout navItems={sellerNavItems} title="Panel de Vendedor">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SellerLayout;
