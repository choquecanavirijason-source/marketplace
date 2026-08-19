import type { Product } from "../entities/Product";
import type { Paginated } from "../entities/Order";

export interface ListProductsParams {
  category?: string;
  search?: string;
}

export interface AdminListProductsParams {
  search?: string;
  category?: string;
  isActive?: boolean | "";
  page?: number;
  limit?: number;
}

export interface UpsertProductData {
  name: string;
  categoryId: number;
  price: string;
  originalPrice?: string | null;
  tag?: string | null;
  sku?: string | null;
  stock?: number;
  weight?: string | null;
  warranty?: string | null;
  isActive?: boolean;
  description?: string;
  image?: string;
}

export interface ProductRepository {
  list(params?: ListProductsParams): Promise<Product[]>;
  listFlashDeals(): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
  adminList(params?: AdminListProductsParams): Promise<Paginated<Product>>;
  toggleActive(id: number, isActive: boolean): Promise<Product>;
  delete(id: number): Promise<void>;
  update(id: number, data: UpsertProductData): Promise<Product>;
}
