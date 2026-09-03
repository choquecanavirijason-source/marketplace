import type { CartItem, Product } from "@/types";
import { useCartStore } from "@/infrastructure/state/cartStore";
import { apiRequest } from "@/config/axios";

export interface CartService {
  getItems(): CartItem[];
  add(product: Product): CartItem[];
  remove(productId: number): CartItem[];
  updateQty(productId: number, delta: number): CartItem[];
  clear(): CartItem[];
  subscribe(listener: () => void): () => void;
}

export type CartRepository = CartService;

export interface ServerCartProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  images: string[];
  stock: number;
  inStock: boolean;
  category: string | null;
}

export interface ServerCartItem {
  id: number;
  productId: number;
  quantity: number;
  product: ServerCartProduct;
}

export interface ServerCartService {
  getCart(): Promise<ServerCartItem[]>;
  addItem(productId: number, quantity: number): Promise<ServerCartItem>;
  updateQuantity(cartItemId: number, quantity: number): Promise<ServerCartItem>;
  removeItem(cartItemId: number): Promise<void>;
  clearCart(): Promise<void>;
}

export type ServerCartRepository = ServerCartService;

export class ZustandCartService implements CartService {
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

export const ZustandCartRepository = ZustandCartService;

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

export class HttpCartService implements ServerCartService {
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

export const HttpCartRepository = HttpCartService;

export class InMemoryServerCartService implements ServerCartService {
  private items: ServerCartItem[] = [];

  async getCart(): Promise<ServerCartItem[]> {
    return this.items;
  }

  async addItem(productId: number, quantity: number): Promise<ServerCartItem> {
    const existing = this.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    const newItem: ServerCartItem = {
      id: Date.now(),
      productId,
      quantity,
      product: {
        id: productId,
        slug: `prod-${productId}`,
        name: `Producto ${productId}`,
        price: 100,
        originalPrice: null,
        image: null,
        images: [],
        stock: 50,
        inStock: true,
        category: null,
      },
    };
    this.items.push(newItem);
    return newItem;
  }

  async updateQuantity(cartItemId: number, quantity: number): Promise<ServerCartItem> {
    const item = this.items.find((i) => i.id === cartItemId);
    if (!item) throw new Error("Item no encontrado");
    item.quantity = quantity;
    return item;
  }

  async removeItem(cartItemId: number): Promise<void> {
    this.items = this.items.filter((i) => i.id !== cartItemId);
  }

  async clearCart(): Promise<void> {
    this.items = [];
  }
}

export const InMemoryServerCartRepository = InMemoryServerCartService;
