import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";

const MAX_RELATED = 4;

export class ListRelatedProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(product: Product): Promise<Product[]> {
    const all = await this.productRepository.list({ category: product.category });
    return all.filter((p) => p.id !== product.id).slice(0, MAX_RELATED);
  }
}
