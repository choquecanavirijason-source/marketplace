import type { Product } from "@/types";
import { useFavoritesStore } from "@/infrastructure/state/favoritesStore";

export interface FavoriteService {
  getItems(): Product[];
  toggle(product: Product): Product[];
  remove(productId: number): Product[];
  subscribe(listener: () => void): () => void;
}

export type FavoriteRepository = FavoriteService;

export class ZustandFavoriteService implements FavoriteService {
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

export const ZustandFavoriteRepository = ZustandFavoriteService;
