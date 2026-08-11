import type { CartRepository } from "@/domain/repositories/CartRepository";
import type { CartItem } from "@/domain/entities/Cart";
import type { Product } from "@/domain/entities/Product";
import { useCartStore } from "@/infrastructure/state/cartStore";

export class ZustandCartRepository implements CartRepository {
  getItems(): CartItem[] {
    return useCartStore.getState().items;
  }

  add(product: Product): CartItem[] {
    useCartStore.getState().add(product);
    return useCartStore.getState().items;
  }

  remove(productId: number): CartItem[] {
    useCartStore.getState().remove(productId);
    return useCartStore.getState().items;
  }

  updateQty(productId: number, delta: number): CartItem[] {
    useCartStore.getState().updateQty(productId, delta);
    return useCartStore.getState().items;
  }

  clear(): CartItem[] {
    useCartStore.getState().clear();
    return useCartStore.getState().items;
  }

  subscribe(listener: () => void): () => void {
    return useCartStore.subscribe(listener);
  }
}
