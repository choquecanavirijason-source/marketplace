import type { ProductRepository } from "@/services";
import type { Product } from "@/types";

export class ToggleProductActiveUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: number, isActive: boolean): Promise<Product> {
    return this.productRepository.toggleActive(id, isActive);
  }
}