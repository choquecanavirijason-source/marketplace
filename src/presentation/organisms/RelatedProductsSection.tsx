"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/domain/entities/Product";
import { useRelatedProducts } from "@/presentation/hooks/useProducts";
import { useCart } from "@/presentation/hooks/useCart";
import { ProductCard } from "@/presentation/organisms/ProductCard";

export function RelatedProductsSection({ product }: { product: Product }) {
  const { data: related } = useRelatedProducts(product.id, product.category);
  const { addToCart } = useCart();
  const router = useRouter();

  if (!related?.length) return null;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">You may also like</p>
          <h2 className="text-2xl font-black text-foreground">Related Products</h2>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all"
        >
          Back to shop <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={addToCart} onSelect={(sel) => router.push(`/product/${sel.id}`)} />
        ))}
      </div>
    </div>
  );
}
