import { getAuthToken } from "@/shared/lib/marketplaceStorage";
import { useCartStore } from "@/infrastructure/state/cartStore";
import { serverCartService } from "@/services/cart.service";
import type { CartItem } from "@/types";

let syncedToken: string | null = null;

export const resetCartSync = (): void => {
  syncedToken = null;
};

const mapItem = (item: any): CartItem => ({
  id: item.product.id,
  slug: item.product.slug,
  name: item.product.name,
  price: item.product.price,
  originalPrice: item.product.originalPrice ?? undefined,
  rating: 0,
  reviews: 0,
  image: item.product.image ?? "",
  images: item.product.images,
  category: item.product.category ?? "",
  inStock: item.product.inStock,
  stock: item.product.stock,
  qty: item.quantity,
  cartItemId: item.id,
});

export const mergeCartWithServer = async (): Promise<void> => {
  const token = getAuthToken();
  if (!token) return;

  if (syncedToken === token) return;
  syncedToken = token;

  try {
    const localItems = useCartStore.getState().items;
    if (localItems.length === 0) {
      const server = await serverCartService.getCart();
      useCartStore.getState().replaceItems(server.map(mapItem));
      return;
    }

    const server = await serverCartService.getCart();
    const serverByProduct = new Map(server.map((item) => [item.productId, item]));

    for (const local of localItems) {
      const existing = serverByProduct.get(local.id);
      if (existing) {
        if (local.qty > existing.quantity) {
          await serverCartService.updateQuantity(existing.id, local.qty);
        }
      } else {
        await serverCartService.addItem(local.id, local.qty);
      }
    }

    const fresh = await serverCartService.getCart();
    useCartStore.getState().replaceItems(fresh.map(mapItem));
  } catch {
    syncedToken = null;
  }
};