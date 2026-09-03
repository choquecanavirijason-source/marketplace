import type { ReviewRepository } from "@/services";
import type { Review } from "@/types";

export class ListReviewsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  execute(productId: number): Promise<Review[]> {
    return this.reviewRepository.listByProductId(productId);
  }
}
