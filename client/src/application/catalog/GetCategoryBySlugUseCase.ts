import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Category } from "@/domain/entities/Category";

export class GetCategoryBySlugUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(slug: string): Promise<Category | null> {
    return this.categoryRepository.getBySlug(slug);
  }
}