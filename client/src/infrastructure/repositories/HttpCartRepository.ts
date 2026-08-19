import { apiRequest } from "@/infrastructure/http/client";
import type {
  ServerCartItem,
  ServerCartRepository,
} from "@/domain/repositories/ServerCartRepository";

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

function mapItem(i: ApiCartItem): ServerCartItem {
  return {
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
  };
}

export class HttpCartRepository implements ServerCartRepository {
  async getCart(): Promise<ServerCartItem[]> {
    const payload = await apiRequest<{ data: ApiCartItem[] }>("/cart", { auth: true });
    return payload.data.map(mapItem);
  }

  async addItem(productId: number, quantity: number): Promise<ServerCartItem> {
    const payload = await apiRequest<{ data: ApiCartItem }>("/cart/items", {
      method: "POST",
      auth: true,
      body: { product_id: productId, quantity },
    });
    return mapItem(payload.data);
  }

  async updateQuantity(cartItemId: number, quantity: number): Promise<ServerCartItem> {
    const payload = await apiRequest<{ data: ApiCartItem }>(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      auth: true,
      body: { quantity },
    });
    return mapItem(payload.data);
  }

  async removeItem(cartItemId: number): Promise<void> {
    await apiRequest(`/cart/items/${cartItemId}`, { method: "DELETE", auth: true });
  }

  async clearCart(): Promise<void> {
    await apiRequest("/cart", { method: "DELETE", auth: true });
  }
}