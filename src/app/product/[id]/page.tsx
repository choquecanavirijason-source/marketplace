"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { ProductDetailTemplate } from "@/presentation/templates/ProductDetailTemplate";
import { useProduct } from "@/presentation/hooks/useProducts";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: product, isLoading } = useProduct(id);

  return (
    <StorefrontTemplate>
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center text-muted-foreground">Loading product…</div>
      ) : !product ? (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-black text-foreground mb-2">Product not found</h1>
          <p className="text-muted-foreground mb-6">This product may have been removed or is no longer available.</p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            Back to shop
          </Link>
        </div>
      ) : (
        <ProductDetailTemplate product={product} />
      )}
    </StorefrontTemplate>
  );
}
