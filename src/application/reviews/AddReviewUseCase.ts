import type { ReviewRepository } from "@/domain/repositories/ReviewRepository";
import type { NewReview, Review } from "@/domain/entities/Review";

export class AddReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  execute(review: NewReview): Promise<Review> {
    if (!review.rating || !review.text.trim() || !review.name.trim()) {
      throw new Error("Rating, name and text are required to submit a review.");
    }
    return this.reviewRepository.add(review);
  }
}
