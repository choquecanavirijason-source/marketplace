import type { CartRepository } from "@/services";
import type { CartItem } from "@/types";
import type { Product } from "@/types";

export class AddToCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(product: Product): CartItem[] {
    if (!product.inStock) {
      throw new Error(`"${product.name}" is out of stock.`);
    }
    return this.cartRepository.add(product);
  }
}
