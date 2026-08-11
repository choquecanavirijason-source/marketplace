import type { Product } from "../entities/Product";

export interface ListProductsParams {
  category?: string;
}

export interface ProductRepository {
  list(params?: ListProductsParams): Promise<Product[]>;
  listFlashDeals(): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
}
