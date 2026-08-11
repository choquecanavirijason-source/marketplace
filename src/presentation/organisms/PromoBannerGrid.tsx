import { ArrowRight } from "lucide-react";

const BANNERS = [
  {
    title: "Radiadores de Aceite", sub: "Ahorrá hasta 25%", cta: "Comprar",
    bg: "from-blue-400 to-cyan-600",
    image: "https://images.unsplash.com/photo-1669725341213-7379ff6c90d5?w=400&h=300&fit=crop&auto=format",
  },
  {
    title: "Termotanques Premium", sub: "Confort todo el año", cta: "Explorar",
    bg: "from-amber-400 to-orange-500",
    image: "https://images.unsplash.com/photo-1601914697928-0b536e76d048?w=400&h=300&fit=crop&auto=format",
  },
  {
    title: "Estufas a Gas", sub: "Calidez garantizada", cta: "Pedir Ahora",
    bg: "from-red-400 to-rose-500",
    image: "https://images.unsplash.com/photo-1608454770647-01dc0f7dd97d?w=400&h=300&fit=crop&auto=format",
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
