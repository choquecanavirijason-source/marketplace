"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductForm } from "@/components/product/ProductForm";
import { container } from "@/infrastructure/container";

export const AdminEditProductPageClient = () => {
  const params = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product-edit", params?.id],
    queryFn: () => container.getProductById.execute(Number(params?.id)),
    enabled: Boolean(params?.id),
  });

  return (
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
  );
};

export default AdminEditProductPageClient;

