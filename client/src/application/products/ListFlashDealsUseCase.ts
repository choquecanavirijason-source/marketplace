import type { ProductRepository } from "@/services";
import type { Product } from "@/types";

export class ListFlashDealsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.productRepository.listFlashDeals();
  }
}
