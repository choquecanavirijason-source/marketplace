"use client";

import { ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useCart } from "@/presentation/hooks/useCart";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { ProductCard } from "@/presentation/organisms/ProductCard";
import { cn } from "@/shared/lib/utils";

const QUICK_FILTERS = ["Todos", "Herramientas Eléctricas", "Herramientas Manuales", "Pinturas", "Electricidad"];

export function FeaturedProductsSection({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const { data: products } = useProducts(activeCategory);
  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <SectionEyebrow icon={Zap}>Selección Especial</SectionEyebrow>
          <h2 className="text-2xl font-black text-foreground">Productos Destacados</h2>
        </div>
        <div className="flex items-center gap-2">
          {QUICK_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "hidden md:block text-xs font-semibold px-3 py-1.5 rounded-full transition-colors",
                activeCategory === cat ? "bg-primary text-white" : "bg-secondary text-foreground hover:bg-primary/10",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            onSelect={(p) => router.push(`/product/${p.id}`)}
          />
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button
          type="button"
          className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 flex items-center gap-2"
        >
          Ver Todos los Productos <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
