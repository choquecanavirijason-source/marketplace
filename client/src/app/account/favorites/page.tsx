"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useHasMounted } from "@/hooks/useHasMounted";

export const AccountFavoritesPage = () => {
  const router = useRouter();
  const mounted = useHasMounted();
  const { items } = useFavorites();
  const { addToCart } = useCart();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Heart className="size-6 text-primary fill-primary/20" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Mis Favoritos
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {mounted && items.length > 0
                ? `${items.length} ${items.length === 1 ? "producto guardado" : "productos guardados"}`
                : "Tus artículos guardados para compras futuras"}
            </p>
          </div>
        </div>

        <Button asChild variant="outline" className="text-xs font-bold gap-2">
          <Link href="/">
            <span>Explorar Tienda</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      {!mounted || items.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-border/80 bg-muted/20 max-w-lg mx-auto">
          <div className="size-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5 text-muted-foreground">
            <Heart className="size-10" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            Tu lista de favoritos está vacía
          </h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Guarda las herramientas y productos que te interesen tocando el ícono de corazón en cualquier tarjeta.
          </p>
          <Button asChild className="h-10 px-6 text-xs font-bold">
            <Link href="/">Explorar productos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product, idx) => (
            <ProductCard
              key={product.id || `acc-fav-${idx}`}
              product={product}
              onAddToCart={addToCart}
              onSelect={(p) => router.push(`/products/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountFavoritesPage;
