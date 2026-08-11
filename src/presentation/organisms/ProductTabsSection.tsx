"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";
import type { Product } from "@/domain/entities/Product";
import { useReviews } from "@/presentation/hooks/useReviews";
import { StarRating } from "@/presentation/molecules/StarRating";
import { ReviewCard } from "@/presentation/molecules/ReviewCard";
import { cn } from "@/shared/lib/utils";

const WHY_CHOOSE = [
  "Sourced from certified organic and sustainable farms",
  "Harvested at peak ripeness and delivered within 24 hours",
  "No artificial preservatives, waxes, or post-harvest chemicals",
  "Supports small family farms and fair-trade practices",
  "Packaged in 100% compostable or recyclable materials",
];

type Tab = "details" | "info" | "reviews";

export function ProductTabsSection({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const { reviews, summary, addReview, isSubmitting } = useReviews(product.id);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const submitReview = async () => {
    if (!reviewRating || !reviewText || !reviewName) return;
    await addReview({ productId: product.id, name: reviewName, rating: reviewRating, text: reviewText });
    setReviewName("");
    setReviewText("");
    setReviewRating(0);
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  };

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden mb-10">
      <div className="flex border-b border-border">
        {(["details", "info", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-colors relative",
              activeTab === tab ? "text-primary bg-secondary/50" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "details" ? "Product Details" : tab === "info" ? "Additional Information" : `Customer Reviews (${reviews.length})`}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "details" && (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">{product.description}</p>
            <h4 className="font-bold text-foreground mb-3">Why choose EkoMart produce?</h4>
            <ul className="space-y-2">
              {WHY_CHOOSE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "info" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Product Name", product.name],
                  ["SKU / Item Code", product.sku ?? "—"],
                  ["Category", product.category],
                  ["Net Weight", product.weight ?? "—"],
                  ["Shelf Life", product.shelfLife ?? "—"],
                  ["Origin", "USA / Certified Organic Farms"],
                  ["Product Type", "Fresh Produce"],
                  ["Return Policy", "7 days from delivery for quality issues"],
                  ["Certifications", "USDA Organic · Non-GMO · Fair Trade"],
                ].map(([label, value], i) => (
                  <tr key={label} className={i % 2 === 0 ? "bg-secondary/40" : "bg-card"}>
                    <td className="py-3 px-4 font-semibold text-foreground w-1/3">{label}</td>
                    <td className="py-3 px-4 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-secondary rounded-2xl p-6 flex flex-col items-center text-center">
              <span className="text-5xl font-black text-foreground">{summary.average || "—"}</span>
              <StarRating rating={summary.average} />
              <p className="text-xs text-muted-foreground mt-2">{summary.total} verified reviews</p>
              <div className="w-full mt-4 space-y-2">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = summary.distribution[star];
                  const pct = summary.total ? (count / summary.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-right text-muted-foreground">{star}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <div className="flex-1 bg-card rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-bold text-foreground mb-4">Write a Review</h4>
                {justSubmitted && (
                  <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm font-semibold mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Review submitted — thank you!
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">Your Rating</label>
                    <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
                  </div>
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                  />
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={!reviewRating || !reviewText || !reviewName || isSubmitting}
                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
