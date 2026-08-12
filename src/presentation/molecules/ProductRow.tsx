"use client";

import { useState } from "react";
import { Check, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/domain/entities/Product";
import { StarRating } from "@/presentation/molecules/StarRating";
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
      className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer"
    >
      <span className="text-3xl font-black text-secondary-foreground/20 leading-none w-6 flex-shrink-0">
        {String(rank).padStart(2, "0")}
      </span>
      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-secondary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <h4 className="text-sm font-bold text-foreground leading-tight truncate">{product.name}</h4>
        <StarRating rating={product.rating} small />
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className={cn(
              "flex items-center gap-1 rounded-lg transition-colors px-2 h-7",
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
      className="flex items-center gap-4 bg-card rounded-2xl p-3 border border-border hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer"
    >
      <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-secondary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate">{product.name}</h4>
        <StarRating rating={product.rating} small />
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
          {product.badge && <span className="text-[10px] font-bold text-accent">{product.badge}</span>}
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
          "flex-shrink-0 flex items-center justify-center gap-1 rounded-lg transition-colors",
          added ? "h-8 px-2.5 bg-green-500 text-white" : "w-8 h-8 bg-secondary hover:bg-primary hover:text-white",
        )}
      >
        {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
        {added && <span className="text-[10px] font-bold whitespace-nowrap">Agregado</span>}
      </button>
    </div>
  );
}
