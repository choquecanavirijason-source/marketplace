import type { AdminListProductsParams, ProductRepository } from "@/services";
import type { Paginated } from "@/types";
import type { Product } from "@/types";

export class AdminListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(params?: AdminListProductsParams, signal?: AbortSignal): Promise<Paginated<Product>> {
    return this.productRepository.adminList(params, signal);
  }
}