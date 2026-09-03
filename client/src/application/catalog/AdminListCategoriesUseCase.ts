import type { AdminListCategoriesParams, CategoryRepository } from "@/services";
import type { Paginated } from "@/types";
import type { Category } from "@/types";

export class AdminListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(params?: AdminListCategoriesParams): Promise<Paginated<Category>> {
    return this.categoryRepository.adminList(params);
  }
}