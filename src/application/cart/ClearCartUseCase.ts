import type { CartRepository } from "@/domain/repositories/CartRepository";
import type { CartItem } from "@/domain/entities/Cart";

export class ClearCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(): CartItem[] {
    return this.cartRepository.clear();
  }
}
