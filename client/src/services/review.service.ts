import type { NewReview, Review } from "@/types";
import { apiRequest } from "@/config/axios";
import { sampleReviewsSeed } from "@/infrastructure/data/reviews.data";

export interface ReviewService {
  listByProductId(productId: number): Promise<Review[]>;
  add(review: NewReview): Promise<Review>;
}

export type ReviewRepository = ReviewService;

export class InMemoryReviewService implements ReviewService {
  private reviews: Review[] = sampleReviewsSeed.map((r) => ({ ...r, productId: 1 }));

  async listByProductId(productId: number): Promise<Review[]> {
    return this.reviews.filter((r) => r.productId === productId);
  }

  async add(review: NewReview): Promise<Review> {
    const newRev: Review = {
      id: Date.now(),
      productId: review.productId,
      name: "Usuario",
      date: new Date().toISOString(),
      rating: review.rating,
      text: review.text,
      helpful: 0,
    };
    this.reviews.push(newRev);
    return newRev;
  }
}

export const InMemoryReviewRepository = InMemoryReviewService;

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

export class HttpReviewService implements ReviewService {
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

export const HttpReviewRepository = HttpReviewService;
