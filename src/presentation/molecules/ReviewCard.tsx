import { ThumbsUp } from "lucide-react";
import type { Review } from "@/domain/entities/Review";
import { StarRating } from "@/presentation/molecules/StarRating";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-secondary rounded-2xl p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
            {review.name[0]}
          </div>
          <div>
            <p className="text-sm font-bold">{review.name}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} small />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
      <button type="button" className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 hover:text-primary transition-colors">
        <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.75} /> Útil ({review.helpful})
      </button>
    </div>
  );
}
