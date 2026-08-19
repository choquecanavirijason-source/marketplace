"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/presentation/hooks/useCart";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { RankedProductRow } from "@/presentation/molecules/ProductRow";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";

export function BestSellersSection() {
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({ pageSize: 4 });
  const bestSellers = data?.pages.flatMap((page) => page.items) ?? [];
  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <SectionEyebrow icon={Star}>Elegidos por la comunidad</SectionEyebrow>
          <h2 className="text-2xl font-black text-foreground">Más Vendidos</h2>
        </div>
      </div>
      {bestSellers.length > 0 && (
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
      )}
      <LoadMoreButton
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </section>
  );
}
