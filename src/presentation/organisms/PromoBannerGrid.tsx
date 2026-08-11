import { ArrowRight } from "lucide-react";

const BANNERS = [
  {
    title: "Fresh Organic Vegetables", sub: "Save up to 25%", cta: "Shop Now",
    bg: "from-green-400 to-emerald-600",
    image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=400&h=300&fit=crop&auto=format",
  },
  {
    title: "Premium Dairy Selection", sub: "Everyday essentials", cta: "Explore",
    bg: "from-amber-400 to-orange-500",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format",
  },
  {
    title: "Seasonal Fruit Baskets", sub: "Freshness guaranteed", cta: "Order Now",
    bg: "from-pink-400 to-rose-500",
    image: "https://images.unsplash.com/photo-1543168256-418811576931?w=400&h=300&fit=crop&auto=format",
  },
];

export function PromoBannerGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BANNERS.map(({ title, sub, cta, bg, image }) => (
          <div
            key={title}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bg} min-h-[180px] flex items-center p-6 cursor-pointer group`}
          >
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">{sub}</p>
              <h3 className="text-white font-black text-lg leading-tight mb-3">{title}</h3>
              <button className="bg-white/20 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white hover:text-foreground transition-all flex items-center gap-1.5">
                {cta} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <img
              src={image}
              alt={title}
              className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
