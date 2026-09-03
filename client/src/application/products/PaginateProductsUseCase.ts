import type { PaginateProductsParams, ProductRepository } from "@/services";
import type { Paginated } from "@/types";
import type { Product } from "@/types";

export class PaginateProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(params?: PaginateProductsParams): Promise<Paginated<Product>> {
    return this.productRepository.paginate(params);
  }
}