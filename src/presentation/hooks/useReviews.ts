"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { NewReview } from "@/domain/entities/Review";

export function useReviews(productId: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => container.listReviews.execute(productId),
  });

  const addReview = useMutation({
    mutationFn: (review: NewReview) => container.addReview.execute(review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });

  const summary = container.getReviewsSummary.execute(query.data ?? []);

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    summary,
    addReview: addReview.mutateAsync,
    isSubmitting: addReview.isPending,
  };
}
