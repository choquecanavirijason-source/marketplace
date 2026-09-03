import type { CategoryRepository } from "@/services";
import type { Category } from "@/types";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(id: number, name: string): Promise<Category> {
    return this.categoryRepository.update(id, name);
  }
}