import type { CategoryRepository } from "@/services";
import type { Category } from "@/types";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(name: string): Promise<Category> {
    return this.categoryRepository.create(name);
  }
}