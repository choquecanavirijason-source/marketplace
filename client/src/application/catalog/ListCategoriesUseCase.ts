import type { CategoryRepository } from "@/services";
import type { Category } from "@/types";

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(): Promise<Category[]> {
    return this.categoryRepository.list();
  }
}
