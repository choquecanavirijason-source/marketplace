import type { ListProductsParams, ProductRepository } from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";
import { flashDealsSeed, productsSeed } from "@/infrastructure/data/products.data";
import { readAddedProducts } from "@/shared/lib/marketplaceStorage";

const baseProducts: Product[] = [...productsSeed, ...flashDealsSeed];

function getAllProducts(): Product[] {
  return [...baseProducts, ...readAddedProducts()];
}

export class InMemoryProductRepository implements ProductRepository {
  async list(params?: ListProductsParams): Promise<Product[]> {
    const products = getAllProducts();

    if (!params?.category || params.category === "Todos") return products;
    return products.filter((p) => p.category === params.category);
  }

  async listFlashDeals(): Promise<Product[]> {
    return [...flashDealsSeed, ...readAddedProducts().filter((p) => p.badge?.toLowerCase() === "nuevo" || p.badge?.toLowerCase() === "oferta")];
  }

  async getById(id: number): Promise<Product | null> {
    return getAllProducts().find((p) => p.id === id) ?? null;
  }
}
