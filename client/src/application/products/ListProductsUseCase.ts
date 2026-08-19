import type { ListProductsParams, ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(params?: ListProductsParams): Promise<Product[]> {
    return this.productRepository.list(params);
  }
}
