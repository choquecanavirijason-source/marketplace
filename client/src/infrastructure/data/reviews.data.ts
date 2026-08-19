import type { Review } from "@/domain/entities/Review";

export const sampleReviewsSeed: Omit<Review, "productId">[] = [
  {
    id: 1, name: "Sarah M.", date: "15 de junio de 2026", rating: 5,
    text: "¡Excelente calefactor! La calidad superó mis expectativas y calienta el ambiente muy rápido. Sin dudas vuelvo a comprar.",
    helpful: 14,
  },
  {
    id: 2, name: "James T.", date: "8 de junio de 2026", rating: 4,
    text: "Buen producto, llegó bien embalado y funciona perfecto. Es un poco más ruidoso de lo esperado pero cumple muy bien.",
    helpful: 7,
  },
  {
    id: 3, name: "Priya K.", date: "29 de mayo de 2026", rating: 5,
    text: "El mejor calefactor que compré en mucho tiempo. Se nota la diferencia en eficiencia comparado con otras marcas.",
    helpful: 21,
  },
];
