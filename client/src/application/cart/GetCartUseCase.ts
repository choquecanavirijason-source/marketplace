import type { CartRepository } from "@/domain/repositories/CartRepository";
import type { CartItem } from "@/domain/entities/Cart";

export class GetCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(): CartItem[] {
    return this.cartRepository.getItems();
  }
}
