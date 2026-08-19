import type { PaginateProductsParams, ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Paginated } from "@/domain/entities/Order";
import type { Product } from "@/domain/entities/Product";

export class PaginateProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(params?: PaginateProductsParams): Promise<Paginated<Product>> {
    return this.productRepository.paginate(params);
  }
}