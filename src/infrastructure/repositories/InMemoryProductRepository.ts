import type { ListProductsParams, ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";
import { flashDealsSeed, productsSeed } from "@/infrastructure/data/products.data";

const allProducts: Product[] = [...productsSeed, ...flashDealsSeed];

export class InMemoryProductRepository implements ProductRepository {
  async list(params?: ListProductsParams): Promise<Product[]> {
    if (!params?.category || params.category === "Todos") return productsSeed;
    return productsSeed.filter((p) => p.category === params.category);
  }

  async listFlashDeals(): Promise<Product[]> {
    return flashDealsSeed;
  }

  async getById(id: number): Promise<Product | null> {
    return allProducts.find((p) => p.id === id) ?? null;
  }
}
