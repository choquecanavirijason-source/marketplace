import type { AdminListCategoriesParams, CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Paginated } from "@/domain/entities/Order";
import type { Category } from "@/domain/entities/Category";

export class AdminListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(params?: AdminListCategoriesParams): Promise<Paginated<Category>> {
    return this.categoryRepository.adminList(params);
  }
}