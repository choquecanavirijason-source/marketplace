"use client";

import { useCallback, useEffect } from "react";
import { container } from "@/infrastructure/container";
import { useCartStore } from "@/infrastructure/state/cartStore";
import { getAuthToken } from "@/shared/lib/marketplaceStorage";
import { mergeCartWithServer } from "@/infrastructure/cartSync";
import type { Product } from "@/domain/entities/Product";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const { total, count } = container.getCartSummary.execute(items);

  useEffect(() => {
    void mergeCartWithServer();
  }, []);

  const addToCart = useCallback((product: Product) => {
    container.addToCart.execute(product);
    if (getAuthToken()) {
      container.cartServer
        .addItem(product.id, 1)
        .catch(() => void mergeCartWithServer());
    }
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    const current = useCartStore.getState().items.find((i) => i.id === productId);
    container.removeFromCart.execute(productId);
    if (getAuthToken() && current?.cartItemId) {
      container.cartServer
        .removeItem(current.cartItemId)
        .catch(() => void mergeCartWithServer());
    }
  }, []);

  const updateQty = useCallback((productId: number, delta: number) => {
    const current = useCartStore.getState().items.find((i) => i.id === productId);
    const nextQty = (current?.qty ?? 0) + delta;

    container.updateCartQty.execute(productId, delta);

    if (!getAuthToken() || !current?.cartItemId) return;

    if (nextQty <= 0) {
      container.cartServer
        .removeItem(current.cartItemId)
        .catch(() => void mergeCartWithServer());
    } else {
      container.cartServer
        .updateQuantity(current.cartItemId, nextQty)
        .catch(() => void mergeCartWithServer());
    }
  }, []);

  const clearCart = useCallback(() => {
    container.clearCart.execute();
    if (getAuthToken()) {
      container.cartServer.clearCart().catch(() => void mergeCartWithServer());
    }
  }, []);

  return {
    items,
    total,
    count,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
  };
}