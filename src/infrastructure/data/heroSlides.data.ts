import type { HeroSlide } from "@/domain/entities/HeroSlide";

export const heroSlidesSeed: HeroSlide[] = [
  {
    title: "Fresh From the Farm", subtitle: "Organic Vegetables",
    desc: "Get up to 30% off on all fresh vegetables this week. Farm-fresh, delivered to your door.",
    cta: "Shop Vegetables", bg: "from-emerald-50 to-green-100", accent: "#2e7d32",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&h=500&fit=crop&auto=format",
  },
  {
    title: "Sun-Ripened Fruits", subtitle: "Fresh Daily",
    desc: "Handpicked seasonal fruits, rich in flavour and nutrients — sourced from local orchards.",
    cta: "Shop Fruits", bg: "from-orange-50 to-amber-100", accent: "#e65100",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=700&h=500&fit=crop&auto=format",
  },
  {
    title: "Organic & Natural", subtitle: "Premium Selection",
    desc: "100% organic, certified produce. No pesticides. No compromises on quality or taste.",
    cta: "Shop Organic", bg: "from-teal-50 to-cyan-100", accent: "#00695c",
    image: "https://images.unsplash.com/photo-1605447813584-26aeb3f8e6ae?w=700&h=500&fit=crop&auto=format",
  },
];
