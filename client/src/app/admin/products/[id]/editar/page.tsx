"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout, adminNavItems } from "@/presentation/organisms/DashboardLayout";
import { ProductForm } from "@/presentation/organisms/ProductForm";
import { container } from "@/infrastructure/container";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [authChecked, setAuthChecked] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product-edit", params.id],
    queryFn: () => container.getProductById.execute(Number(params.id)),
    enabled: Boolean(params.id),
  });

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/admin/products");
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
          <h1 className="mt-2 text-3xl font-black text-foreground">Editar producto</h1>
          <p className="text-sm text-muted-foreground">Modificá los datos del producto y guardá los cambios</p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Cargando producto…</div>
        ) : product ? (
          <ProductForm product={product} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No se encontró el producto.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}