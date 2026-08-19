"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { ProductCard } from "@/presentation/organisms/ProductCard";
import { LoadMoreButton } from "@/presentation/molecules/LoadMoreButton";
import { useInfiniteProducts } from "@/presentation/hooks/useInfiniteProducts";
import { useCart } from "@/presentation/hooks/useCart";
import { container } from "@/infrastructure/container";

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => container.getCategoryBySlug.execute(slug),
  });

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProducts({
    category: category?.slug,
    enabled: !!category?.slug,
  });
  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const { addToCart } = useCart();

  if (category === null) {
    return (
      <StorefrontTemplate>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <PackageSearch className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-black text-foreground mt-4">Categoría no encontrada</h1>
          <p className="text-sm text-muted-foreground mt-1">La categoría que buscás no existe o fue eliminada.</p>
          <button
            type="button"
            onClick={() => router.push("/categorias")}
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a todas las categorías
          </button>
        </div>
      </StorefrontTemplate>
    );
  }

  return (
    <StorefrontTemplate>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <button
          type="button"
          onClick={() => router.push("/categorias")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Todas las categorías
        </button>

        {category ? (
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: category.color }}>
              <category.icon className="w-7 h-7 text-foreground/70" strokeWidth={1.75} />
            </span>
            <div>
              <h1 className="text-3xl font-black text-foreground">{category.name}</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Cargando productos…" : `${total} producto${total === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 h-24 animate-pulse rounded-2xl bg-muted" />
        )}

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
        ) : products && products.length > 0 ? (
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
            <PackageSearch className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Todavía no hay productos en esta categoría.</p>
          </div>
        )}
      </section>
    </StorefrontTemplate>
  );
}