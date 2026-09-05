"use client";

import { useState } from "react";
import { Check, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { StarRating } from "@/components/feedback/StarRating";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function RankedProductRow({
  product,
  rank,
  onSelect,
  onAddToCart,
}: {
  product: Product;
  rank: number;
  onSelect: () => void;
  onAddToCart: () => void;
}) {
  const [added, setAdded] = useState(false);

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-3 sm:gap-4 bg-card rounded-2xl p-3 sm:p-4 border border-border hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer"
    >
      <span className="text-2xl sm:text-3xl font-black text-secondary-foreground/20 leading-none w-5 sm:w-6 flex-shrink-0">
        {String(rank).padStart(2, "0")}
      </span>
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-secondary flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-secondary flex-shrink-0 flex items-center justify-center text-muted-foreground text-[10px] font-medium">Sin imagen</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground">{product.category}</p>
        <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight truncate">{product.name}</h4>
        <StarRating rating={product.rating} small />
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-xs sm:text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className={cn(
              "flex items-center gap-1 rounded-lg transition-all px-2 min-h-[36px] sm:min-h-[28px] h-auto sm:h-7 active:scale-90",
              added ? "bg-green-500 text-white" : "bg-secondary hover:bg-primary hover:text-white",
            )}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {added && <span className="text-[10px] font-bold whitespace-nowrap">Agregado</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CompactProductRow({
  product,
  onSelect,
  onAddToCart,
}: {
  product: Product;
  onSelect: () => void;
  onAddToCart: () => void;
}) {
  const [added, setAdded] = useState(false);

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-3 sm:gap-4 bg-card rounded-2xl p-3 border border-border hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer"
    >
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-secondary flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary flex-shrink-0 flex items-center justify-center text-muted-foreground text-[10px] font-medium">Sin imagen</div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-semibold truncate">{product.name}</h4>
        <StarRating rating={product.rating} small />
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs sm:text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
          {product.badge && <span className="text-[10px] font-bold text-accent hidden sm:inline">{product.badge}</span>}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart();
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className={cn(
          "flex-shrink-0 flex items-center justify-center gap-1 rounded-lg transition-all active:scale-90",
          added ? "h-9 px-2.5 bg-green-500 text-white" : "w-9 h-9 sm:w-8 sm:h-8 bg-secondary hover:bg-primary hover:text-white",
        )}
      >
        {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
        {added && <span className="text-[10px] font-bold whitespace-nowrap">Agregado</span>}
      </button>
    </div>
  );
}
