"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useCart } from "@/presentation/hooks/useCart";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { RankedProductRow } from "@/presentation/molecules/ProductRow";

export function BestSellersSection() {
  const { data: products } = useProducts();
  const { addToCart } = useCart();
  const router = useRouter();
  const bestSellers = products?.slice(0, 4) ?? [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <SectionEyebrow icon={Star}>Community picks</SectionEyebrow>
          <h2 className="text-2xl font-black text-foreground">Best Sellers</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bestSellers.map((product, i) => (
          <RankedProductRow
            key={product.id}
            product={product}
            rank={i + 1}
            onSelect={() => router.push(`/product/${product.id}`)}
            onAddToCart={() => addToCart(product)}
          />
        ))}
      </div>
    </section>
  );
}
