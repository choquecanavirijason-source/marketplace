import type { FavoriteRepository } from "@/services";
import type { Product } from "@/types";

export class ToggleFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  execute(product: Product): Product[] {
    return this.favoriteRepository.toggle(product);
  }
}
