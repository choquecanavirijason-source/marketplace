import type { Product } from "@/types";
import { useFavoritesStore } from "@/context/favoritesStore";

export const favoriteService = {
  getItems: (): Product[] => {
    return useFavoritesStore.getState().items;
  },

  toggle: (product: Product): Product[] => {
    useFavoritesStore.getState().toggle(product);
    return useFavoritesStore.getState().items;
  },

  remove: (productId: number): Product[] => {
    useFavoritesStore.getState().remove(productId);
    return useFavoritesStore.getState().items;
  },

  subscribe: (listener: () => void): (() => void) => {
    return useFavoritesStore.subscribe(listener);
  },
};
