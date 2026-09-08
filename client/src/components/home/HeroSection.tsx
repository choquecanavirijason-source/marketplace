"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useApiQuery } from "@/hooks/useApi";
import { heroSlideService } from "@/services/hero-slide.service";

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

export const HeroSection = () => {
  const { data: slides } = useApiQuery(["hero-slides"], () => heroSlideService.list());
  const [heroIdx, setHeroIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!slides?.length) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setHeroIdx((i) => (i + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides?.length]);

  const handleSlideChange = (newIdx: number) => {
    if (newIdx === heroIdx) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setHeroIdx(newIdx);
      setIsTransitioning(false);
    }, 300);
  };

  if (!slides?.length) return null;
  const slide = slides[heroIdx];

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
        <div className={`lg:col-span-8 rounded-3xl bg-gradient-to-br ${slide.bg} overflow-hidden relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px] flex items-center`}>
          <div
            className={`relative z-10 p-6 sm:p-8 md:p-12 max-w-sm transition-all duration-300 ${
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}
          >
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ background: slide.accent + "20", color: slide.accent }}
            >
              {slide.subtitle}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3" style={{ color: slide.accent }}>
              {slide.title}
            </h1>
            <p className="text-sm text-foreground/70 mb-5 md:mb-6 leading-relaxed line-clamp-3">{slide.desc}</p>
            <button
              type="button"
              className="flex items-center gap-2 text-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg"
              style={{ background: slide.accent }}
            >
              {slide.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className={`absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-end overflow-hidden transition-opacity duration-300 ${isTransitioning ? "opacity-40" : "opacity-80"}`}>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          </div>

          <div className="absolute bottom-4 left-6 sm:left-8 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSlideChange(i)}
                className={`rounded-full transition-all duration-300 ${i === heroIdx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-primary/30 hover:bg-primary/50"}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleSlideChange((heroIdx - 1 + slides.length) % slides.length)}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-9 sm:h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-md transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleSlideChange((heroIdx + 1) % slides.length)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-9 sm:h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-md transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
          {SIDE_CARDS.map(({ title, sub, label, color, textColor, subColor, img }) => (
            <div
              key={title}
              className={`rounded-3xl bg-gradient-to-br ${color} overflow-hidden relative min-h-[140px] lg:min-h-[165px] p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover-lift`}
            >
              <div>
                <span className={`text-[10px] sm:text-xs font-bold ${subColor} uppercase tracking-wider`}>{label}</span>
                <h3 className={`text-base sm:text-lg font-black ${textColor} mt-1 leading-tight whitespace-pre-line`}>{title}</h3>
                <p className={`text-[10px] sm:text-xs ${subColor}/70 mt-1`}>{sub}</p>
              </div>
              <button type="button" className={`mt-2 sm:mt-3 text-xs font-bold ${subColor} flex items-center gap-1 hover:gap-2 transition-all`}>
                Comprar Ahora <ArrowRight className="w-3 h-3" />
              </button>
              <img src={img} alt="" className="absolute right-0 bottom-0 h-full w-1/2 object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
