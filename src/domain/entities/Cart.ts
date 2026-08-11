import type { Product } from "./Product";

export interface CartItem extends Product {
  qty: number;
}
