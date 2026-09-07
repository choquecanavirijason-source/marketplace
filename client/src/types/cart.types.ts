import type { Product } from "./product.types";

export interface CartItem extends Product {
  qty: number;
  cartItemId?: number;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemsCount: number;
}

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
