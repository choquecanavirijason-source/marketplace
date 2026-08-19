import type { Category } from "../entities/Category";
import type { Paginated } from "../entities/Order";

export interface AdminListCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CategoryRepository {
  list(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  adminList(params?: AdminListCategoriesParams): Promise<Paginated<Category>>;
  create(name: string): Promise<Category>;
  update(id: number, name: string): Promise<Category>;
  delete(id: number): Promise<void>;
}