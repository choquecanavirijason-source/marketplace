import type { FavoriteRepository } from "@/domain/repositories/FavoriteRepository";
import type { Product } from "@/domain/entities/Product";

export class RemoveFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  execute(productId: number): Product[] {
    return this.favoriteRepository.remove(productId);
  }
}
