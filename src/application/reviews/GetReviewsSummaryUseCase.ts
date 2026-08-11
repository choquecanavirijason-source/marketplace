import type { Review } from "@/domain/entities/Review";

export interface ReviewsSummary {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export class GetReviewsSummaryUseCase {
  execute(reviews: Review[]): ReviewsSummary {
    const total = reviews.length;
    const average = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    for (const review of reviews) {
      const star = review.rating as 1 | 2 | 3 | 4 | 5;
      if (distribution[star] !== undefined) distribution[star] += 1;
    }
    return { average: Number(average.toFixed(1)), total, distribution };
  }
}
