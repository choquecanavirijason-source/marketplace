import type { CartItem } from "@/domain/entities/Cart";

export interface CartSummary {
  total: number;
  count: number;
}

export class GetCartSummaryUseCase {
  execute(items: CartItem[]): CartSummary {
    return {
      total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      count: items.reduce((sum, item) => sum + item.qty, 0),
    };
  }
}
