import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Category } from "@/domain/entities/Category";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(id: number, name: string): Promise<Category> {
    return this.categoryRepository.update(id, name);
  }
}