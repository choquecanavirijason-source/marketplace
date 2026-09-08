"use client";

import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { SectionEyebrow } from "@/components/common/SectionEyebrow";
import { CountdownTimer } from "@/components/feedback/CountdownTimer";
import { LoadMoreButton } from "@/components/common/LoadMoreButton";
import { ProductCard } from "@/components/product/ProductCard";

const FLASH_DEAL_DURATION_SECS = 4 * 3600 + 23 * 60 + 45;

export const FlashDealsSection = () => {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    tag: "Oferta,Nuevo",
    pageSize: 12,
  });
  const deals = data?.pages.flatMap((page) => page.items) ?? [];
  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      <div className="bg-card rounded-2xl md:rounded-3xl border border-border p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
          <div>
            <SectionEyebrow icon={Clock} tone="accent">Tiempo limitado</SectionEyebrow>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">Ofertas Flash</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Termina en:</p>
          </div>
          <CountdownTimer targetSecs={FLASH_DEAL_DURATION_SECS} />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="aspect-[4/3] skeleton-shimmer" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 w-1/3 rounded skeleton-shimmer" />
                  <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                  <div className="mt-3 h-9 w-full rounded-xl skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">
              {deals.map((product, idx) => (
                <ProductCard
                  key={product.id || `deal-${idx}`}
                  product={product}
                  onAddToCart={addToCart}
                  onSelect={(p) => router.push(`/products/${p.id}`)}
                />
              ))}
            </div>
            <LoadMoreButton
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8 sm:py-10">
            Todavía no hay ofertas disponibles.
          </p>
        )}
      </div>
    </section>
  );
};
