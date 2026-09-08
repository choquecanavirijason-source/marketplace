"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontTemplate } from "@/components/layout/StorefrontTemplate";
import { ProductCard } from "@/components/product/ProductCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useHasMounted } from "@/hooks/useHasMounted";

const FavoritesPage = () => {
  const router = useRouter();
  const mounted = useHasMounted();
  const { items } = useFavorites();
  const { addToCart } = useCart();

  return (
    <StorefrontTemplate>
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="w-3.5 h-3.5" /> Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Favoritos</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Heart className="w-5 h-5 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Mis Favoritos</h1>
            <p className="text-xs text-muted-foreground">
              {mounted ? `${items.length} ${items.length === 1 ? "producto guardado" : "productos guardados"}` : "Cargando…"}
            </p>
          </div>
        </div>

        {!mounted ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-72 rounded-2xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card rounded-3xl border border-border p-12 text-center max-w-md mx-auto my-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h2 className="text-lg font-bold text-foreground mb-2">No tenés favoritos guardados</h2>
            <p className="text-muted-foreground mb-8">Guardá los productos que te interesan tocando el corazón en cualquier tarjeta.</p>
            <Button asChild className="h-11 px-8">
              <Link href="/">Explorar productos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product, idx) => (
              <ProductCard
                key={product.id || `fav-prod-${idx}`}
                product={product}
                onAddToCart={addToCart}
                onSelect={(p) => router.push(`/products/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </StorefrontTemplate>
  );
};

export default FavoritesPage;
