export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function discountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}
