"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { StorefrontTemplate } from "@/components/layout/StorefrontTemplate";
import { ProductDetailTemplate } from "@/components/product/ProductDetailTemplate";
import { useApiQuery } from "@/hooks/useApi";
import { productService } from "@/services/product.service";

export default function ProductDetailPageClient() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: product, isLoading } = useApiQuery(["product", id], () => productService.getById(id), {
    enabled: !Number.isNaN(id) && id > 0,
  });

  return (
    <StorefrontTemplate>
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center text-muted-foreground">Cargando producto…</div>
      ) : !product ? (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-black text-foreground mb-2">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-6">Este producto pudo haber sido eliminado o ya no está disponible.</p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            Volver a la tienda
          </Link>
        </div>
      ) : (
        <ProductDetailTemplate product={product} />
      )}
    </StorefrontTemplate>
  );
}
