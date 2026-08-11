import type { Review } from "@/domain/entities/Review";

export const sampleReviewsSeed: Omit<Review, "productId">[] = [
  {
    id: 1, name: "Sarah M.", date: "June 15, 2026", rating: 5,
    text: "Absolutely fresh and delicious! The quality exceeded my expectations. Will definitely order again.",
    helpful: 14,
  },
  {
    id: 2, name: "James T.", date: "June 8, 2026", rating: 4,
    text: "Good product, arrived fresh and well packaged. Slightly smaller than expected but taste is excellent.",
    helpful: 7,
  },
  {
    id: 3, name: "Priya K.", date: "May 29, 2026", rating: 5,
    text: "Best organic option I've found online. The flavour is noticeably better than supermarket produce.",
    helpful: 21,
  },
];
