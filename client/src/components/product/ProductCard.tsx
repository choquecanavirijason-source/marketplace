"use client";

import { useState } from "react";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { ProductStatusBadge } from "@/components/product/ProductStatusBadge";
import { StarRating } from "@/components/feedback/StarRating";
import { ProductPriceBlock } from "@/components/product/ProductPriceBlock";
import { useFavorites } from "@/hooks/useFavorites";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/shared/lib/utils";

export function ProductCard({
  product,
  onAddToCart,
  onSelect,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelect: (product: Product) => void;
}) {
  const [added, setAdded] = useState(false);
  const mounted = useHasMounted();
  const { isFavorite, toggleFavorite } = useFavorites();
  const wished = mounted && isFavorite(product.id);

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 relative">
      {product.badge && <ProductStatusBadge badge={product.badge} className="absolute top-3 left-3 z-10" />}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(product);
        }}
        className={cn(
          "absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-card rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-90",
          wished ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <Heart className={cn("w-4 h-4", wished ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-gray-500")} />
      </button>

      <div className="relative overflow-hidden bg-secondary aspect-[4/3] cursor-pointer" onClick={() => onSelect(product)}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">
            Sin imagen
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="bg-white dark:bg-card text-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 hover:bg-primary hover:text-white transition-colors active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" /> Vista Rápida
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3
          onClick={() => onSelect(product)}
          className="font-semibold text-xs sm:text-sm text-foreground leading-tight mb-2 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] cursor-pointer hover:text-primary transition-colors"
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <StarRating rating={product.rating} small />
          <span className="text-[10px] sm:text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        {product.weight && <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">{product.weight}</p>}

        <ProductPriceBlock price={product.price} originalPrice={product.originalPrice} />

        <button
          type="button"
          onClick={() => {
            onAddToCart(product);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className={cn(
            "w-full mt-2 sm:mt-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97]",
            added ? "bg-green-500 text-white" : "bg-secondary text-primary hover:bg-primary hover:text-white",
          )}
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {added ? "¡Agregado!" : "Agregar al Carrito"}
        </button>
      </div>
    </div>
  );
}
