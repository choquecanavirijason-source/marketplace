import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: number): Promise<Product | null> {
    return this.productRepository.getById(id);
  }
}
