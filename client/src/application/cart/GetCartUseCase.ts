import type { CartRepository } from "@/services";
import type { CartItem } from "@/types";

export class GetCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(): CartItem[] {
    return this.cartRepository.getItems();
  }
}
