import type { CartItem } from "@/domain/entities/Cart";
import type { ServerCartItem, ServerCartRepository } from "@/domain/repositories/ServerCartRepository";
import { useCartStore } from "@/infrastructure/state/cartStore";

export function mapServerCartItem(item: ServerCartItem): CartItem {
  return {
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
  };
}

export class SyncCartUseCase {
  constructor(private readonly serverCartRepository: ServerCartRepository) {}

  async execute(localItems: CartItem[]): Promise<void> {
    if (localItems.length === 0) {
      const server = await this.serverCartRepository.getCart();
      useCartStore.getState().replaceItems(server.map(mapServerCartItem));
      return;
    }

    const server = await this.serverCartRepository.getCart();
    const serverByProduct = new Map(server.map((item) => [item.productId, item]));

    for (const local of localItems) {
      const existing = serverByProduct.get(local.id);
      if (existing) {
        if (local.qty > existing.quantity) {
          await this.serverCartRepository.updateQuantity(existing.id, local.qty);
        }
      } else {
        await this.serverCartRepository.addItem(local.id, local.qty);
      }
    }

    const fresh = await this.serverCartRepository.getCart();
    useCartStore.getState().replaceItems(fresh.map(mapServerCartItem));
  }
}