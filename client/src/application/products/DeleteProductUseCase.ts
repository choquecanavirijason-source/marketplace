import type { ProductRepository } from "@/domain/repositories/ProductRepository";

export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: number): Promise<void> {
    return this.productRepository.delete(id);
  }
}