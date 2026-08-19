"use client";

import { ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/presentation/hooks/useCart";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { ProductCard } from "@/presentation/organisms/ProductCard";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";

export function FeaturedProductsSection({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const { data: categories } = useCategories();
  const { addToCart } = useCart();
  const router = useRouter();

  const quickFilters = ["Todos", ...(categories ?? []).map((category) => category.name)];
  const activeSlug =
    activeCategory === "Todos"
      ? undefined
      : categories?.find((category) => category.name === activeCategory)?.slug;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    category: activeSlug,
    pageSize: 12,
  });
  const products = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionEyebrow icon={Zap}>Selección Especial</SectionEyebrow>
          <h2 className="text-2xl font-black text-foreground">Productos Destacados</h2>
        </div>
        <select
          value={activeCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="w-full sm:w-64 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary"
        >
          {quickFilters.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
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
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
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
        <div className="rounded-2xl border border-border bg-card p-14 text-center">
          <Zap className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Todavía no hay productos en esta categoría.</p>
        </div>
      )}
      <div className="flex justify-center mt-8">
        <button
          type="button"
          className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 flex items-center gap-2"
        >
          Ver Todos los Productos <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
