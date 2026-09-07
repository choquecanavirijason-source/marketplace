import type { CartItem, Product, ServerCartItem } from "@/types";
import { useCartStore } from "@/infrastructure/state/cartStore";
import { apiRequest } from "@/config/axios";

export class CartService {
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

export const cartService = new CartService();

interface ApiCartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    image: string | null;
    images: string[];
    stock: number;
    in_stock: boolean;
    category: string | null;
  };
}

const mapServerItem = (i: ApiCartItem): ServerCartItem => ({
  id: i.id,
  productId: i.product_id,
  quantity: i.quantity,
  product: {
    id: i.product.id,
    slug: i.product.slug,
    name: i.product.name,
    price: i.product.price,
    originalPrice: i.product.original_price,
    image: i.product.image,
    images: i.product.images,
    stock: i.product.stock,
    inStock: i.product.in_stock,
    category: i.product.category,
  },
});

export class ServerCartService {
  async getCart(): Promise<ServerCartItem[]> {
    const payload = await apiRequest<{ data: ApiCartItem[] }>("/cart", { auth: true });
    return payload.data.map(mapServerItem);
  }

  async addItem(productId: number, quantity: number): Promise<ServerCartItem> {
    const payload = await apiRequest<{ data: ApiCartItem }>("/cart/items", {
      method: "POST",
      auth: true,
      body: { product_id: productId, quantity },
    });
    return mapServerItem(payload.data);
  }

  async updateQuantity(cartItemId: number, quantity: number): Promise<ServerCartItem> {
    const payload = await apiRequest<{ data: ApiCartItem }>(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      auth: true,
      body: { quantity },
    });
    return mapServerItem(payload.data);
  }

  async removeItem(cartItemId: number): Promise<void> {
    await apiRequest(`/cart/items/${cartItemId}`, { method: "DELETE", auth: true });
  }

  async clearCart(): Promise<void> {
    await apiRequest("/cart", { method: "DELETE", auth: true });
  }
}

export const serverCartService = new ServerCartService();
