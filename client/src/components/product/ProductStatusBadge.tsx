import { cn } from "@/shared/lib/utils";

export function ProductStatusBadge({ badge, className }: { badge: string; className?: string }) {
  return (
    <span
      className={cn(
        "text-xs font-bold px-2.5 py-1 rounded-full",
        badge === "Nuevo" ? "bg-blue-500 text-white"
          : badge === "Popular" ? "bg-red-500 text-white"
          : "bg-primary text-primary-foreground",
        className,
      )}
    >
      {badge}
    </span>
  );
}

export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  if (percent <= 0) return null;
  return (
    <span className={cn("text-xs font-bold text-accent bg-orange-50 px-1.5 py-0.5 rounded", className)}>
      -{percent}%
    </span>
  );
}
