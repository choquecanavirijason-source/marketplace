import type { FavoriteRepository } from "@/services";
import type { Product } from "@/types";

export class ListFavoritesUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  execute(): Product[] {
    return this.favoriteRepository.getItems();
  }
}
