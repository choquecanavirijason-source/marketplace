import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

export class ListFlashDealsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.productRepository.listFlashDeals();
  }
}
