import type { CategoryRepository } from "@/services";
import type { Category } from "@/types";

export class GetCategoryBySlugUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(slug: string): Promise<Category | null> {
    return this.categoryRepository.getBySlug(slug);
  }
}