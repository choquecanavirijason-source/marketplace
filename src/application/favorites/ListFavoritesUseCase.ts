import type { FavoriteRepository } from "@/domain/repositories/FavoriteRepository";
import type { Product } from "@/domain/entities/Product";

export class ListFavoritesUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  execute(): Product[] {
    return this.favoriteRepository.getItems();
  }
}
