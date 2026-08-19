import { apiRequest } from "@/infrastructure/http/client";
import type { ReviewRepository } from "@/domain/repositories/ReviewRepository";
import type { NewReview, Review } from "@/domain/entities/Review";

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

function mapReview(r: ApiReview): Review {
  return {
    id: r.id,
    productId: r.product_id,
    name: r.user_name,
    date: r.created_at,
    rating: r.rating,
    text: r.comment,
    helpful: 0,
  };
}

export class HttpReviewRepository implements ReviewRepository {
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