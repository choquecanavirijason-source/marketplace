import type { CartItem, Product, ServerCartItem } from "@/types";
import { useCartStore } from "@/context/cartStore";
import { apiRequest } from "@/config/axios";

export const cartService = {
  getItems: (): CartItem[] => {
    return useCartStore.getState().items;
  },

  add: (product: Product): CartItem[] => {
    useCartStore.getState().add(product);
    return useCartStore.getState().items;
  },

  remove: (productId: number): CartItem[] => {
    useCartStore.getState().remove(productId);
    return useCartStore.getState().items;
  },

  updateQty: (productId: number, delta: number): CartItem[] => {
    useCartStore.getState().updateQty(productId, delta);
    return useCartStore.getState().items;
  },

  clear: (): CartItem[] => {
    useCartStore.getState().clear();
    return useCartStore.getState().items;
  },

  subscribe: (listener: () => void): (() => void) => {
    return useCartStore.subscribe(listener);
  },
};

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

const mapServerItem = (i: any): ServerCartItem => {
  const prod = i?.product || {};
  const productId = Number(i?.productId ?? i?.product_id ?? prod.id ?? 0);
  const name = String(prod.name ?? i?.name ?? i?.productName ?? "Producto");
  const slug = String(prod.slug ?? i?.slug ?? i?.productSlug ?? "");
  const price = Number(prod.price ?? i?.unitPrice ?? i?.currentPrice ?? 0);
  const originalPrice = prod.original_price ?? prod.originalPrice ?? null;
  const image = prod.image ?? i?.image ?? null;
  const images = Array.isArray(prod.images) ? prod.images : (image ? [image] : []);
  const stock = Number(prod.stock ?? i?.stockAvailable ?? 99);
  const inStock = Boolean(prod.in_stock ?? prod.inStock ?? (stock > 0));
  const category = String(prod.category ?? i?.category ?? "");

  return {
    id: Number(i?.id ?? 0),
    productId,
    quantity: Number(i?.quantity ?? 1),
    product: {
      id: productId,
      slug,
      name,
      price,
      originalPrice: originalPrice !== null ? Number(originalPrice) : null,
      image,
      images,
      stock,
      inStock,
      category,
    },
  };
};

export const serverCartService = {
  getCart: async (): Promise<ServerCartItem[]> => {
    const payload = await apiRequest<any>("/cart", { auth: true });
    const raw = payload?.data || payload || {};
    const rawItems = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.items)
      ? raw.items
      : [];
    return rawItems.map(mapServerItem);
  },

  addItem: async (productId: number, quantity: number): Promise<ServerCartItem> => {
    const payload = await apiRequest<any>("/cart/items", {
      method: "POST",
      auth: true,
      body: { productId, product_id: productId, quantity },
    });
    const raw = payload?.data || payload || {};
    const rawItems = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.items)
      ? raw.items
      : [raw];
    const found = rawItems.find((it: any) => (it.productId ?? it.product_id) === productId) || rawItems[0] || raw;
    return mapServerItem(found);
  },

  updateQuantity: async (cartItemId: number, quantity: number): Promise<ServerCartItem> => {
    const payload = await apiRequest<any>(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      auth: true,
      body: { quantity },
    });
    const raw = payload?.data || payload || {};
    const rawItems = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.items)
      ? raw.items
      : [raw];
    const found = rawItems.find((it: any) => it.id === cartItemId) || rawItems[0] || raw;
    return mapServerItem(found);
  },

  removeItem: async (cartItemId: number): Promise<void> => {
    await apiRequest(`/cart/items/${cartItemId}`, { method: "DELETE", auth: true });
  },

  clearCart: async (): Promise<void> => {
    await apiRequest("/cart", { method: "DELETE", auth: true });
  },
};
