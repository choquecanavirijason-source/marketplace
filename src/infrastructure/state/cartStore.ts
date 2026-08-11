import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/domain/entities/Cart";
import type { Product } from "@/domain/entities/Product";

interface CartState {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  updateQty: (productId: number, delta: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) =>
        set(() => {
          const existing = get().items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: get().items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }
          return { items: [...get().items, { ...product, qty: 1 }] };
        }),
      remove: (productId) =>
        set(() => ({ items: get().items.filter((i) => i.id !== productId) })),
      updateQty: (productId, delta) =>
        set(() => ({
          items: get()
            .items.map((i) => (i.id === productId ? { ...i, qty: i.qty + delta } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "ferromax-cart" },
  ),
);
