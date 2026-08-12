"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, Home } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { ProductCard } from "@/presentation/organisms/ProductCard";
import { useFavorites } from "@/presentation/hooks/useFavorites";
import { useCart } from "@/presentation/hooks/useCart";

export default function FavoritesPage() {
  const router = useRouter();
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

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight">Mis Favoritos</h1>
            <p className="text-sm text-muted-foreground">
              {items.length > 0 ? `${items.length} ${items.length === 1 ? "producto guardado" : "productos guardados"}` : "Todavía no guardaste productos"}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-black text-foreground mb-2">Tu lista de favoritos está vacía</h2>
            <p className="text-muted-foreground mb-8">Guardá los productos que te interesan tocando el corazón en cualquier tarjeta.</p>
            <Button asChild className="h-11 px-8">
              <Link href="/">Explorar productos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onSelect={(p) => router.push(`/product/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </StorefrontTemplate>
  );
}
