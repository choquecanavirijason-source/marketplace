import type { CartRepository } from "@/services";
import type { CartItem } from "@/types";

export class RemoveFromCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(productId: number): CartItem[] {
    return this.cartRepository.remove(productId);
  }
}
