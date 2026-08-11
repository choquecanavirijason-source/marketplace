import { Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/domain/entities/Product";
import { StarRating } from "@/presentation/molecules/StarRating";
import { formatPrice } from "@/shared/lib/format";

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
            }}
            className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
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
        }}
        className="flex-shrink-0 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
