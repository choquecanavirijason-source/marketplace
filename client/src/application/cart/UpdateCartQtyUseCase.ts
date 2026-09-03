import type { CartRepository } from "@/services";
import type { CartItem } from "@/types";

export class UpdateCartQtyUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(productId: number, delta: number): CartItem[] {
    return this.cartRepository.updateQty(productId, delta);
  }
}
