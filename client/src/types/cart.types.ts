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
