import { getAuthToken } from "@/shared/lib/marketplaceStorage";
import { useCartStore } from "./cartStore";
import { serverCartService } from "@/services/cart.service";
import type { CartItem } from "@/types";

let syncedToken: string | null = null;

export const resetCartSync = (): void => {
  syncedToken = null;
};

const mapItem = (item: any): CartItem => {
  const prod = item?.product || {};
  const id = Number(prod.id ?? item?.productId ?? item?.id ?? 0);
  const slug = String(prod.slug ?? item?.slug ?? "");
  const name = String(prod.name ?? item?.name ?? "Producto");
  const price = Number(prod.price ?? item?.price ?? item?.unitPrice ?? 0);
  const originalPrice = prod.originalPrice ?? item?.originalPrice ?? undefined;
  const image = String(prod.image ?? item?.image ?? "");
  const images = Array.isArray(prod.images) ? prod.images : (image ? [image] : []);
  const category = String(prod.category ?? item?.category ?? "");
  const stock = Number(prod.stock ?? item?.stock ?? item?.stockAvailable ?? 99);
  const inStock = Boolean(prod.inStock ?? item?.inStock ?? (stock > 0));

  return {
    id,
    slug,
    name,
    price,
    originalPrice,
    rating: 0,
    reviews: 0,
    image,
    images,
    category,
    inStock,
    stock,
    qty: Number(item?.quantity ?? item?.qty ?? 1),
    cartItemId: item?.id ?? item?.cartItemId,
  };
};

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
