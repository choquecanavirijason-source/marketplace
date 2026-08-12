"use client";

import { useState } from "react";
import { Check, GitCompare, Heart, RotateCcw, Share2, Shield, ShoppingCart, Truck } from "lucide-react";
import type { Product } from "@/domain/entities/Product";
import { StarRating } from "@/presentation/molecules/StarRating";
import { QuantitySelector } from "@/presentation/molecules/QuantitySelector";
import { TrustBadgeItem } from "@/presentation/molecules/TrustBadgeItem";
import { PaymentIconsRow } from "@/presentation/molecules/PaymentIconsRow";
import { useCart } from "@/presentation/hooks/useCart";
import { useFavorites } from "@/presentation/hooks/useFavorites";
import { discountPercent, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const TRUST_ITEMS = [
  { icon: Truck, text: "Envío gratis en compras superiores a $50" },
  { icon: RotateCcw, text: "Devoluciones fáciles dentro de 30 días" },
  { icon: Shield, text: "Pago 100% seguro y protección de datos" },
];

export function ProductInfoPanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const wished = isFavorite(product.id);
  const percent = discountPercent(product.price, product.originalPrice);

  const handleAddCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full">{product.category}</span>
        {product.inStock ? (
          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <Check className="w-3 h-3" /> En Stock
          </span>
        ) : (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Sin Stock</span>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight">{product.name}</h1>

      <div className="flex items-center gap-3">
        <StarRating rating={product.rating} />
        <span className="text-sm text-muted-foreground">({product.reviews} reseñas)</span>
        <span className="w-px h-4 bg-border" />
        <span className="text-xs font-semibold text-green-600">✓ 94% lo recomienda</span>
      </div>

      <div className="flex items-baseline gap-3 py-3 border-y border-border">
        <span className="text-3xl font-black text-primary">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
        )}
        {percent > 0 && <span className="bg-accent/10 text-accent font-bold text-sm px-2 py-0.5 rounded-lg">Ahorrás {percent}%</span>}
      </div>

      {product.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{product.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        {product.sku && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">SKU:</span>
            <span className="font-semibold">{product.sku}</span>
          </div>
        )}
        {product.weight && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Peso:</span>
            <span className="font-semibold">{product.weight}</span>
          </div>
        )}
        {product.warranty && (
          <div className="flex items-center gap-2 col-span-2">
            <span className="text-muted-foreground">Garantía:</span>
            <span className="font-semibold">{product.warranty}</span>
          </div>
        )}
      </div>

      {product.tags && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Etiquetas:</span>
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <QuantitySelector qty={qty} onChange={setQty} />
        <button
          type="button"
          onClick={handleAddCart}
          className={cn(
            "flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm",
            addedToCart ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-orange-700",
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {addedToCart ? "¡Agregado al Carrito!" : `Agregar al Carrito · ${formatPrice(product.price * qty)}`}
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => toggleFavorite(product)}
          className={cn("flex items-center gap-1.5 font-semibold transition-colors", wished ? "text-red-500" : "text-muted-foreground hover:text-red-500")}
        >
          <Heart className={cn("w-4 h-4", wished && "fill-red-500")} />
          {wished ? "En Favoritos" : "Agregar a Favoritos"}
        </button>
        <span className="w-px h-4 bg-border" />
        <button type="button" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-semibold">
          <GitCompare className="w-4 h-4" /> Comparar
        </button>
        <span className="w-px h-4 bg-border" />
        <button type="button" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-semibold">
          <Share2 className="w-4 h-4" /> Compartir
        </button>
      </div>

      <div className="bg-secondary rounded-2xl p-4 space-y-2.5">
        {TRUST_ITEMS.map((item) => (
          <TrustBadgeItem key={item.text} {...item} />
        ))}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Pago 100% seguro garantizado</p>
        <PaymentIconsRow />
      </div>
    </div>
  );
}
