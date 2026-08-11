import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Category } from "@/domain/entities/Category";
import { categoriesSeed } from "@/infrastructure/data/categories.data";

export class InMemoryCategoryRepository implements CategoryRepository {
  async list(): Promise<Category[]> {
    return categoriesSeed;
  }
}
