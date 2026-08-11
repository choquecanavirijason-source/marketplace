import type { CartRepository } from "@/domain/repositories/CartRepository";
import type { CartItem } from "@/domain/entities/Cart";

export class UpdateCartQtyUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(productId: number, delta: number): CartItem[] {
    return this.cartRepository.updateQty(productId, delta);
  }
}
