"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { useApiQuery } from "@/hooks/useApi";
import { productService } from "@/services/product.service";
import { useCart } from "@/hooks/useCart";
import { ProductCard } from "@/components/product/ProductCard";

export const RelatedProductsSection = ({ product }: { product: Product }) => {
  const { data: related = [] } = useApiQuery(
    ["related-products", product.id, product.category],
    () => productService.listRelated(product.id, product.category),
    { enabled: Boolean(product.id) }
  );
  const { addToCart } = useCart();
  const router = useRouter();

  if (!related?.length) return null;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">También te puede interesar</p>
          <h2 className="text-2xl font-black text-foreground">Productos Relacionados</h2>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all"
        >
          Volver a la tienda <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p, idx) => (
          <ProductCard key={p.id || `related-${idx}`} product={p} onAddToCart={addToCart} onSelect={(sel) => router.push(`/products/${sel.id}`)} />
        ))}
      </div>
    </div>
  );
};
