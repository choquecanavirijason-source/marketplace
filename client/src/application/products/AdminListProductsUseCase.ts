import type { AdminListProductsParams, ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Paginated } from "@/domain/entities/Order";
import type { Product } from "@/domain/entities/Product";

export class AdminListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(params?: AdminListProductsParams): Promise<Paginated<Product>> {
    return this.productRepository.adminList(params);
  }
}