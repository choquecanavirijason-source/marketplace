"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlides } from "@/presentation/hooks/useCatalog";

const SIDE_CARDS = [
  {
    title: "Ofertas Flash\nDiarias", sub: "Hasta 60% off", label: "Tiempo Limitado",
    color: "from-orange-50 to-red-100", textColor: "text-red-700", subColor: "text-red-600",
    img: "https://images.unsplash.com/photo-1783477108548-ed63e5766c42?w=200&h=200&fit=crop&auto=format",
  },
  {
    title: "Nuevos Ingresos\nEsta Semana", sub: "Stock renovado", label: "Novedades",
    color: "from-purple-50 to-violet-100", textColor: "text-violet-700", subColor: "text-violet-600",
    img: "https://images.unsplash.com/photo-1627257062083-0b09fafdeed5?w=200&h=200&fit=crop&auto=format",
  },
];

export function HeroSection() {
  const { data: slides } = useHeroSlides();
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    if (!slides?.length) return;
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides?.length]);

  if (!slides?.length) return null;
  const slide = slides[heroIdx];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className={`lg:col-span-8 rounded-3xl bg-gradient-to-br ${slide.bg} overflow-hidden relative min-h-[360px] flex items-center`}>
          <div className="relative z-10 p-8 md:p-12 max-w-sm">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ background: slide.accent + "20", color: slide.accent }}
            >
              {slide.subtitle}
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3" style={{ color: slide.accent }}>
              {slide.title}
            </h1>
            <p className="text-sm text-foreground/70 mb-6 leading-relaxed">{slide.desc}</p>
            <button
              type="button"
              className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg"
              style={{ background: slide.accent }}
            >
              {slide.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-end overflow-hidden">
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-80" />
          </div>
          <div className="absolute bottom-4 left-8 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroIdx(i)}
                className={`rounded-full transition-all ${i === heroIdx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-primary/30"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setHeroIdx((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setHeroIdx((i) => (i + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="lg:col-span-4 flex flex-row lg:flex-col gap-4">
          {SIDE_CARDS.map(({ title, sub, label, color, textColor, subColor, img }) => (
            <div
              key={title}
              className={`flex-1 rounded-3xl bg-gradient-to-br ${color} overflow-hidden relative min-h-[165px] p-6 flex flex-col justify-between`}
            >
              <div>
                <span className={`text-xs font-bold ${subColor} uppercase tracking-wider`}>{label}</span>
                <h3 className={`text-lg font-black ${textColor} mt-1 leading-tight whitespace-pre-line`}>{title}</h3>
                <p className={`text-xs ${subColor}/70 mt-1`}>{sub}</p>
              </div>
              <button type="button" className={`mt-3 text-xs font-bold ${subColor} flex items-center gap-1 hover:gap-2 transition-all`}>
                Comprar Ahora <ArrowRight className="w-3 h-3" />
              </button>
              <img src={img} alt="" className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-50" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
