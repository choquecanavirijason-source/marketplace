"use client";

import { container } from "@/infrastructure/container";
import { useFavoritesStore } from "@/infrastructure/state/favoritesStore";
import type { Product } from "@/types";

export const useFavorites = () => {
  const items = useFavoritesStore((state) => state.items);

  return {
    items,
    count: items.length,
    isFavorite: (productId: number) => items.some((i) => i.id === productId),
    toggleFavorite: (product: Product) => container.toggleFavorite.execute(product),
    removeFavorite: (productId: number) => container.removeFavorite.execute(productId),
  };
}
