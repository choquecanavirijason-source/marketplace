import type { FavoriteRepository } from "@/services";
import type { Product } from "@/types";

export class RemoveFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  execute(productId: number): Product[] {
    return this.favoriteRepository.remove(productId);
  }
}
