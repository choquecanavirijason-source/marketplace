import type { NewReview, Review, ReviewSummary } from "@/types";
import { apiRequest } from "@/config/axios";

interface ApiReview {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

const mapReview = (r: ApiReview): Review => ({
  id: r.id,
  productId: r.product_id,
  name: r.user_name,
  date: r.created_at,
  rating: r.rating,
  text: r.comment,
  helpful: 0,
});

export class ReviewService {
  async listByProductId(productId: number): Promise<Review[]> {
    const payload = await apiRequest<{ data: ApiReview[] }>(`/products/${productId}/reviews`);
    return payload.data.map(mapReview);
  }

  async add(review: NewReview): Promise<Review> {
    const payload = await apiRequest<{ data: ApiReview }>(`/products/${review.productId}/reviews`, {
      method: "POST",
      auth: true,
      body: {
        rating: review.rating,
        comment: review.text,
      },
    });
    return mapReview(payload.data);
  }
}

export const calculateReviewsSummary = (reviews: Review[]): ReviewSummary => {
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const star = review.rating as 1 | 2 | 3 | 4 | 5;
    if (distribution[star] !== undefined) distribution[star] += 1;
  }
  return { average: Number(average.toFixed(1)), total, distribution };
};

export const reviewService = new ReviewService();
