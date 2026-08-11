import type { HeroSlide } from "@/domain/entities/HeroSlide";

export const heroSlidesSeed: HeroSlide[] = [
  {
    title: "Calor para\ntu Hogar", subtitle: "Calefactores Eléctricos",
    desc: "Hasta 30% off en calefactores eléctricos esta semana. Entrega rápida a todo el país.",
    cta: "Ver Calefactores", bg: "from-orange-50 to-amber-100", accent: "#e65100",
    image: "https://images.unsplash.com/photo-1669724290258-cbc731160fb3?w=700&h=500&fit=crop&auto=format",
  },
  {
    title: "Radiadores\nde Alta Gama", subtitle: "Confort Todo el Invierno",
    desc: "Radiadores de aceite y toalleros eléctricos, calefacción constante y silenciosa para cada ambiente.",
    cta: "Ver Radiadores", bg: "from-blue-50 to-cyan-100", accent: "#0277bd",
    image: "https://images.unsplash.com/photo-1599028274511-e02a767949a3?w=700&h=500&fit=crop&auto=format",
  },
  {
    title: "Chimeneas\nEléctricas", subtitle: "Diseño y Calidez",
    desc: "Efecto llama realista sin obra ni instalación. Calidez y estilo para tu living.",
    cta: "Ver Chimeneas", bg: "from-teal-50 to-cyan-100", accent: "#00695c",
    image: "https://images.unsplash.com/photo-1622308023558-2130696ec5cd?w=700&h=500&fit=crop&auto=format",
  },
];
