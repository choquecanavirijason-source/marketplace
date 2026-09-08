"use client";

import { favoriteService } from "@/services/favorite.service";
import { useFavoritesStore } from "@/context/favoritesStore";
import type { Product } from "@/types";

export const useFavorites = () => {
  const items = useFavoritesStore((state) => state.items);

  return {
    items,
    count: items.length,
    isFavorite: (productId: number) => items.some((i) => i.id === productId),
    toggleFavorite: (product: Product) => favoriteService.toggle(product),
    removeFavorite: (productId: number) => favoriteService.remove(productId),
  };
};

