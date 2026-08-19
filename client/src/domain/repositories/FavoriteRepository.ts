import type { Product } from "../entities/Product";

export interface FavoriteRepository {
  getItems(): Product[];
  toggle(product: Product): Product[];
  remove(productId: number): Product[];
  subscribe(listener: () => void): () => void;
}
