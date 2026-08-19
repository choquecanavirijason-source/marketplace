import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

export class ToggleProductActiveUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: number, isActive: boolean): Promise<Product> {
    return this.productRepository.toggleActive(id, isActive);
  }
}