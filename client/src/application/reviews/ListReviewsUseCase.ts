import type { ReviewRepository } from "@/domain/repositories/ReviewRepository";
import type { Review } from "@/domain/entities/Review";

export class ListReviewsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  execute(productId: number): Promise<Review[]> {
    return this.reviewRepository.listByProductId(productId);
  }
}
