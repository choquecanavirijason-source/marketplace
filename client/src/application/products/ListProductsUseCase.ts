import type { ListProductsParams, ProductRepository } from "@/services";
import type { Product } from "@/types";

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(params?: ListProductsParams): Promise<Product[]> {
    return this.productRepository.list(params);
  }
}
