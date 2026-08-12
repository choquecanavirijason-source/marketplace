import type { FavoriteRepository } from "@/domain/repositories/FavoriteRepository";
import type { Product } from "@/domain/entities/Product";

export class ToggleFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  execute(product: Product): Product[] {
    return this.favoriteRepository.toggle(product);
  }
}
