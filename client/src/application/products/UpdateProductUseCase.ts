import type { ProductRepository, UpsertProductData } from "@/services";
import type { Product } from "@/types";

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: number, data: UpsertProductData): Promise<Product> {
    return this.productRepository.update(id, data);
  }
}