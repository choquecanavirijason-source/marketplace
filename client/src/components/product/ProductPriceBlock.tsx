import { OriginalPriceText, PriceText } from "@/components/common/PriceText";
import { DiscountBadge } from "@/components/product/ProductStatusBadge";
import { discountPercent } from "@/shared/lib/format";

export function ProductPriceBlock({
  price,
  originalPrice,
  size = "md",
}: {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const percent = discountPercent(price, originalPrice);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-1.5">
        <PriceText value={price} size={size} />
        {originalPrice && <OriginalPriceText value={originalPrice} />}
      </div>
      <DiscountBadge percent={percent} />
    </div>
  );
}
