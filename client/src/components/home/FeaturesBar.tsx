import { Headphones, RotateCcw, Shield, Truck } from "lucide-react";
import { FeatureBarItem } from "@/components/feedback/TrustBadgeItem";

const FEATURES = [
  { icon: Truck, title: "Envío Gratis", desc: "En compras superiores a $50", color: "text-green-600" },
  { icon: RotateCcw, title: "Devoluciones Fáciles", desc: "Política de 30 días", color: "text-blue-600" },
  { icon: Shield, title: "Pago Seguro", desc: "100% protegido", color: "text-purple-600" },
  { icon: Headphones, title: "Soporte 24/7", desc: "Siempre listos para ayudar", color: "text-orange-600" },
];

export const FeaturesBar = () => {
  return (
    <section className="bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-0 md:divide-x md:divide-border">
          {FEATURES.map((feature, idx) => (
            <FeatureBarItem key={feature.title || `feat-${idx}`} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
