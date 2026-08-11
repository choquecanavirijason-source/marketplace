import type { NewReview, Review } from "../entities/Review";

export interface ReviewRepository {
  listByProductId(productId: number): Promise<Review[]>;
  add(review: NewReview): Promise<Review>;
}
