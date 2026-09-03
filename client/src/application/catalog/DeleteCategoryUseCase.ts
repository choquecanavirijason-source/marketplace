import type { CategoryRepository } from "@/services";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(id: number): Promise<void> {
    return this.categoryRepository.delete(id);
  }
}