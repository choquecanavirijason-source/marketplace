import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/domain/entities/Product";

interface FavoritesState {
  items: Product[];
  toggle: (product: Product) => void;
  remove: (productId: number) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set(() => {
          const exists = get().items.some((i) => i.id === product.id);
          return {
            items: exists
              ? get().items.filter((i) => i.id !== product.id)
              : [...get().items, product],
          };
        }),
      remove: (productId) =>
        set(() => ({ items: get().items.filter((i) => i.id !== productId) })),
    }),
    { name: "ferromax-favorites" },
  ),
);
