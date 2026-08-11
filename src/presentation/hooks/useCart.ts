"use client";

import { container } from "@/infrastructure/container";
import { useCartStore } from "@/infrastructure/state/cartStore";
import type { Product } from "@/domain/entities/Product";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const { total, count } = container.getCartSummary.execute(items);

  return {
    items,
    total,
    count,
    addToCart: (product: Product) => container.addToCart.execute(product),
    removeFromCart: (productId: number) => container.removeFromCart.execute(productId),
    updateQty: (productId: number, delta: number) => container.updateCartQty.execute(productId, delta),
  };
}
