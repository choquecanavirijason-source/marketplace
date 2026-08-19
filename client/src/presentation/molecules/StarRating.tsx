"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function StarRating({
  rating,
  small,
  interactive,
  onChange,
}: {
  rating: number;
  small?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = interactive ? (hovered || rating) >= s : s <= Math.floor(rating);
        return (
          <Star
            key={s}
            onClick={() => interactive && onChange?.(s)}
            onMouseEnter={() => interactive && setHovered(s)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={cn(
              small ? "w-3 h-3" : "w-4 h-4",
              "transition-colors",
              filled ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-gray-100",
              interactive && "cursor-pointer hover:scale-110",
            )}
          />
        );
      })}
    </div>
  );
}
