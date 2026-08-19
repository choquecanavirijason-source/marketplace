"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/presentation/hooks/useCart";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { CompactProductRow } from "@/presentation/molecules/ProductRow";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";
import type { Product } from "@/domain/entities/Product";

export function TrendingNewArrivalsSection() {
  const trending = useInfiniteProducts({ pageSize: 4, startPage: 2 });
  const newArrivals = useInfiniteProducts({ tag: "Nuevo", pageSize: 4 });
  const { addToCart } = useCart();
  const router = useRouter();

  const trendingItems = trending.data?.pages.flatMap((page) => page.items) ?? [];
  const newArrivalItems = newArrivals.data?.pages.flatMap((page) => page.items) ?? [];

  const columns: { title: "Tendencias" | "Nuevos Ingresos"; items: Product[] }[] = [
    { title: "Tendencias", items: trendingItems },
    { title: "Nuevos Ingresos", items: newArrivalItems },
  ];

  const loadMore = {
    Tendencias: () => trending.fetchNextPage(),
    "Nuevos Ingresos": () => newArrivals.fetchNextPage(),
  } as const;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {columns.map(({ title, items }) => (
          <div key={title}>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl font-black text-foreground">{title}</h2>
              <a href="#" className="text-xs font-semibold text-primary flex items-center gap-1">
                Ver todo <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-3">
              {items.map((product) => (
                <CompactProductRow
                  key={product.id}
                  product={product}
                  onSelect={() => router.push(`/product/${product.id}`)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
            <LoadMoreButton
              hasMore={
                title === "Tendencias" ? trending.hasNextPage : newArrivals.hasNextPage
              }
              isLoading={
                title === "Tendencias" ? trending.isFetchingNextPage : newArrivals.isFetchingNextPage
              }
              onLoadMore={loadMore[title]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
