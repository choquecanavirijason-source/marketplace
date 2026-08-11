import type { ReviewRepository } from "@/domain/repositories/ReviewRepository";
import type { NewReview, Review } from "@/domain/entities/Review";
import { sampleReviewsSeed } from "@/infrastructure/data/reviews.data";

const reviewsByProduct = new Map<number, Review[]>();

function seedFor(productId: number): Review[] {
  if (!reviewsByProduct.has(productId)) {
    reviewsByProduct.set(
      productId,
      sampleReviewsSeed.map((review) => ({ ...review, productId })),
    );
  }
  return reviewsByProduct.get(productId)!;
}

export class InMemoryReviewRepository implements ReviewRepository {
  async listByProductId(productId: number): Promise<Review[]> {
    return seedFor(productId);
  }

  async add(review: NewReview): Promise<Review> {
    const created: Review = {
      id: Date.now(),
      productId: review.productId,
      name: review.name,
      date: "Just now",
      rating: review.rating,
      text: review.text,
      helpful: 0,
    };
    const existing = seedFor(review.productId);
    reviewsByProduct.set(review.productId, [created, ...existing]);
    return created;
  }
}
