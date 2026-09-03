import type { ProductRepository } from "@/services";
import type { Product } from "@/types";

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: number): Promise<Product | null> {
    return this.productRepository.getById(id);
  }
}
