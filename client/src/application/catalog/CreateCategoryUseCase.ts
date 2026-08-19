import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Category } from "@/domain/entities/Category";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(name: string): Promise<Category> {
    return this.categoryRepository.create(name);
  }
}