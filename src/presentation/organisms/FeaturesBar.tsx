import { Headphones, RotateCcw, Shield, Truck } from "lucide-react";
import { FeatureBarItem } from "@/presentation/molecules/TrustBadgeItem";

const FEATURES = [
  { icon: Truck, title: "Free Delivery", desc: "On orders over $50", color: "text-green-600" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy", color: "text-blue-600" },
  { icon: Shield, title: "Secure Payment", desc: "100% protected", color: "text-purple-600" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help", color: "text-orange-600" },
];

export function FeaturesBar() {
  return (
    <section className="bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
          {FEATURES.map((feature) => (
            <FeatureBarItem key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
