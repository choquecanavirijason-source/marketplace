"use client";

import { DashboardLayout, adminNavItems } from "@/components/layout/DashboardLayout";
import { ProductForm } from "@/components/product/ProductForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminCreateProductPage() {
  return (
    <ProtectedRoute roles={["admin", "superadmin"]} redirectTo="/account/login?redirect=/admin/products/create">
      <DashboardLayout navItems={adminNavItems} title="Panel administrador">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Nuevo producto</h1>
            <p className="text-sm text-muted-foreground">Completá los datos para publicar un producto en el marketplace</p>
          </div>

          <ProductForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
