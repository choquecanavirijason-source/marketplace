"use client";

import { useCallback, useEffect } from "react";
import { useCartStore } from "@/context/cartStore";
import { getAuthToken } from "@/shared/lib/marketplaceStorage";
import { mergeCartWithServer } from "@/context/cartSync";
import { cartService, serverCartService } from "@/services/cart.service";
import type { Product } from "@/types";

export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    void mergeCartWithServer();
  }, []);

  const addToCart = useCallback((product: Product) => {
    cartService.add(product);
    if (getAuthToken()) {
      serverCartService
        .addItem(product.id, 1)
        .catch(() => void mergeCartWithServer());
    }
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    const current = useCartStore.getState().items.find((i) => i.id === productId);
    cartService.remove(productId);
    if (getAuthToken() && current?.cartItemId) {
      serverCartService
        .removeItem(current.cartItemId)
        .catch(() => void mergeCartWithServer());
    }
  }, []);

  const updateQty = useCallback((productId: number, delta: number) => {
    const current = useCartStore.getState().items.find((i) => i.id === productId);
    const nextQty = (current?.qty ?? 0) + delta;

    cartService.updateQty(productId, delta);

    if (!getAuthToken() || !current?.cartItemId) return;

    if (nextQty <= 0) {
      serverCartService
        .removeItem(current.cartItemId)
        .catch(() => void mergeCartWithServer());
    } else {
      serverCartService
        .updateQuantity(current.cartItemId, nextQty)
        .catch(() => void mergeCartWithServer());
    }
  }, []);

  const clearCart = useCallback(() => {
    cartService.clear();
    if (getAuthToken()) {
      serverCartService.clearCart().catch(() => void mergeCartWithServer());
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
};