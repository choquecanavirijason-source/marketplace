import type { ProductRepository, UpsertProductData } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: number, data: UpsertProductData): Promise<Product> {
    return this.productRepository.update(id, data);
  }
}