"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, adminNavItems } from "@/presentation/organisms/DashboardLayout";
import { ProductForm } from "@/presentation/organisms/ProductForm";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";

export default function AdminCreateProductPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/admin/products/crear");
      return;
    }
    if (getCurrentUser()?.roleName !== "admin") {
      router.push("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-background px-4 py-24 text-center text-muted-foreground">Verificando sesión…</main>
    );
  }

  return (
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
  );
}