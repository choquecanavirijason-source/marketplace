import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/lib/format";

export function PriceText({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  } as const;
  return (
    <span className={cn("font-black text-primary", sizes[size], className)}>
      {formatPrice(value)}
    </span>
  );
}

export function OriginalPriceText({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" } as const;
  return <span className={cn("text-muted-foreground line-through", sizes[size])}>{formatPrice(value)}</span>;
}
