import type { CartRepository } from "@/domain/repositories/CartRepository";
import type { CartItem } from "@/domain/entities/Cart";

export class RemoveFromCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(productId: number): CartItem[] {
    return this.cartRepository.remove(productId);
  }
}
