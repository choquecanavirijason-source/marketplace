"use client";

import { ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useApiQuery } from "@/hooks/useApi";
import { categoryService } from "@/services/category.service";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { SectionEyebrow } from "@/components/common/SectionEyebrow";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadMoreButton } from "@/components/common/LoadMoreButton";

export const FeaturedProductsSection = ({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) => {
  const { data: categories } = useApiQuery(["categories"], () => categoryService.list());
  const { addToCart } = useCart();
  const router = useRouter();

  const validCategoryNames = (categories ?? [])
    .map((category) => category.name)
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
  const quickFilters = ["Todos", ...Array.from(new Set(validCategoryNames))];
  const activeSlug =
    activeCategory === "Todos"
      ? undefined
      : (categories ?? []).find((cat) => cat.name === activeCategory)?.slug;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    category: activeSlug,
    pageSize: 12,
  });
  const products = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div className="mb-5 md:mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionEyebrow icon={Zap}>Selección Especial</SectionEyebrow>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">Productos Destacados</h2>
        </div>
        <select
          value={activeCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="w-full sm:w-64 rounded-xl border border-border bg-card bg-white dark:bg-[#1c1815] px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
        >
          {quickFilters.map((cat, idx) => (
            <option key={cat || `filter-${idx}`} value={cat} className="bg-card bg-white dark:bg-[#1c1815] text-foreground">
              {cat}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
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
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id || `featured-${idx}`}
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
        <div className="rounded-2xl border border-border bg-card p-10 sm:p-14 text-center">
          <Zap className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Todavía no hay productos en esta categoría.</p>
        </div>
      )}
      <div className="flex justify-center mt-6 md:mt-8">
        <button
          type="button"
          className="border-2 border-primary text-primary font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 flex items-center gap-2 active:scale-95 text-sm"
        >
          Ver Todos los Productos <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
