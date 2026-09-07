import type { Product } from "@/types";
import { useFavoritesStore } from "@/infrastructure/state/favoritesStore";

export class FavoriteService {
  getItems(): Product[] {
    return useFavoritesStore.getState().items;
  }

  toggle(product: Product): Product[] {
    useFavoritesStore.getState().toggle(product);
    return useFavoritesStore.getState().items;
  }

  remove(productId: number): Product[] {
    useFavoritesStore.getState().remove(productId);
    return useFavoritesStore.getState().items;
  }

  subscribe(listener: () => void): () => void {
    return useFavoritesStore.subscribe(listener);
  }
}

export const favoriteService = new FavoriteService();
