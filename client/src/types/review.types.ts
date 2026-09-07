export interface Review {
  id: number;
  productId: number;
  name: string;
  date: string;
  rating: number;
  text: string;
  helpful: number;
}

export interface NewReview {
  productId: number;
  name: string;
  rating: number;
  text: string;
}

export interface ReviewsSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
