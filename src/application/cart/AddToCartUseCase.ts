import type { CartRepository } from "@/domain/repositories/CartRepository";
import type { CartItem } from "@/domain/entities/Cart";
import type { Product } from "@/domain/entities/Product";

export class AddToCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  execute(product: Product): CartItem[] {
    if (!product.inStock) {
      throw new Error(`"${product.name}" is out of stock.`);
    }
    return this.cartRepository.add(product);
  }
}
