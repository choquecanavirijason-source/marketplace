import type { FavoriteRepository } from "@/domain/repositories/FavoriteRepository";
import type { Product } from "@/domain/entities/Product";
import { useFavoritesStore } from "@/infrastructure/state/favoritesStore";

export class ZustandFavoriteRepository implements FavoriteRepository {
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
