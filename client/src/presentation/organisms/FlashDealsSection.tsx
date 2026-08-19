"use client";

import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/presentation/hooks/useCart";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { CountdownTimer } from "@/presentation/molecules/CountdownTimer";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";
import { ProductCard } from "@/presentation/organisms/ProductCard";

const FLASH_DEAL_DURATION_SECS = 4 * 3600 + 23 * 60 + 45;

export function FlashDealsSection() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    tag: "Oferta,Nuevo",
    pageSize: 12,
  });
  const deals = data?.pages.flatMap((page) => page.items) ?? [];
  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-card rounded-3xl border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <SectionEyebrow icon={Clock} tone="accent">Tiempo limitado</SectionEyebrow>
            <h2 className="text-2xl font-black text-foreground">Ofertas Flash</h2>
            <p className="text-sm text-muted-foreground mt-1">Termina en:</p>
          </div>
          <CountdownTimer targetSecs={FLASH_DEAL_DURATION_SECS} />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-44 bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-secondary" />
                  <div className="h-4 w-3/4 rounded bg-secondary" />
                  <div className="h-3 w-1/2 rounded bg-secondary" />
                  <div className="mt-3 h-9 w-full rounded-xl bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {deals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onSelect={(p) => router.push(`/product/${p.id}`)}
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
          <p className="text-sm text-muted-foreground text-center py-10">
            Todavía no hay ofertas disponibles.
          </p>
        )}
      </div>
    </section>
  );
}
