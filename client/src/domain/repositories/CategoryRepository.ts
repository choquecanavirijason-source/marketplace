import type { Category } from "../entities/Category";

export interface CategoryRepository {
  list(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  create(name: string): Promise<Category>;
  update(id: number, name: string): Promise<Category>;
  delete(id: number): Promise<void>;
}