import type { CartRepository } from "@/services";
import type { CartItem } from "@/types";

export class ClearCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(): CartItem[] {
    return this.cartRepository.clear();
  }
}
