import type { CartItem } from "../entities/Cart";
import type { Product } from "../entities/Product";

export interface CartRepository {
  getItems(): CartItem[];
  add(product: Product): CartItem[];
  remove(productId: number): CartItem[];
  updateQty(productId: number, delta: number): CartItem[];
  clear(): CartItem[];
  subscribe(listener: () => void): () => void;
}
